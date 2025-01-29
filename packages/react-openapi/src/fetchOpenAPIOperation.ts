import { toJSON, fromJSON } from 'flatted';
import YAML from 'yaml';
import swagger2openapi, { ConvertOutputOptions } from 'swagger2openapi';

import {
    OpenAPICustomSpecProperties,
    OpenAPIFetcher,
    OpenAPIV3XDocument,
    OpenAPIV3XOperationObject,
    OpenAPIV3XSecuritySchemeObject,
    OpenAPIV3XServerObject,
} from './types';
import { dereference, validate, traverse, AnyObject } from '@scalar/openapi-parser';
import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { noReference } from './utils';

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3XServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3XOperationObject;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3XSecuritySchemeObject][];
}

export { toJSON, fromJSON };

/**
 * Resolve an OpenAPI operation in a file and compile it to a more usable format.
 */
export async function fetchOpenAPIOperation(
    input: {
        url: string;
        path: string;
        method: string;
    },
    rawFetcher: OpenAPIFetcher,
): Promise<OpenAPIOperationData | null> {
    const fetcher = cacheFetcher(rawFetcher);

    const specData = await fetcher.fetch(input.url);

    const { valid } = await validate(specData);

    // Spec is invalid, we stop here.
    if (!valid) {
        throw new Error(`Invalid OpenAPI spec: ${input.url}`);
    }

    let { schema } = await dereference(specData);

    // No schema, we stop here.
    if (!schema) {
        throw new Error(`Schema undefined following the dereference operation: ${input.url}`);
    }
    schema = schema as OpenAPIV3XDocument;

    let operation = getOperationByPathAndMethod(schema, input.path, input.method);

    if (!operation) {
        return null;
    }

    // Parse description in markdown
    const { parseMarkdown } = fetcher;
    if (parseMarkdown) {
        operation = await parseDescriptions(operation, parseMarkdown);
    }

    // Resolve common parameters
    const commonParameters = getPathObjectParameter(schema, input.path);
    if (commonParameters) {
        operation = {
            ...operation,
            parameters: [...commonParameters, ...(operation.parameters ?? [])],
        };
    }

    const servers: OpenAPIV3XServerObject[] = 'servers' in schema ? (schema.servers ?? []) : [];
    const security: OpenAPIV3XSecuritySchemeObject[] = operation.security ?? schema.security ?? [];

    // Resolve securities
    const securities: OpenAPIOperationData['securities'] = [];
    for (const entry of security) {
        const securityKey = Object.keys(entry)[0];
        const securityScheme = schema.components?.securitySchemes?.[securityKey];
        if (securityScheme) {
            securities.push([securityKey, noReference(securityScheme)]);
        }
    }

    return {
        servers,
        operation,
        method: input.method,
        path: input.path,
        securities,
        'x-codeSamples':
            typeof specData['x-codeSamples'] === 'boolean' ? specData['x-codeSamples'] : undefined,
        'x-hideTryItPanel':
            typeof specData['x-hideTryItPanel'] === 'boolean'
                ? specData['x-hideTryItPanel']
                : undefined,
    };
}

async function parseDescriptions<T extends AnyObject>(
    spec: T,
    parseMarkdown: (input: string) => Promise<string>,
): Promise<T> {
    const promises: Record<string, Promise<string>> = {};
    const results: Record<string, string> = {};
    traverse(spec, (obj) => {
        if ('description' in obj && typeof obj.description === 'string') {
            promises[obj.description] = parseMarkdown(obj.description);
        }
        return obj;
    });
    await Promise.all(
        Object.entries(promises).map(async ([key, promise]) => {
            results[key] = await promise;
        }),
    );
    return traverse(spec, (obj) => {
        if ('description' in obj && typeof obj.description === 'string') {
            obj.description = results[obj.description];
        }
        return obj;
    }) as T;
}

type PathObject = OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject;

/**
 * Get a path object from its path.
 */
function getPathObject(schema: OpenAPIV3XDocument, path: string): PathObject | null {
    if (schema.paths?.[path]) {
        return schema.paths[path];
    }
    return null;
}

/**
 * Resolve parameters from a path in an OpenAPI schema.
 */
function getPathObjectParameter(
    schema: OpenAPIV3XDocument,
    path: string,
): (OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject)[] | null {
    const pathObject = getPathObject(schema, path) as OpenAPIV3.PathItemObject | null;
    if (pathObject?.parameters) {
        return pathObject.parameters.map(noReference);
    }
    return null;
}

/**
 * Get an operation by its path and method.
 */
function getOperationByPathAndMethod(schema: OpenAPIV3XDocument, path: string, method: string) {
    const pathObject = getPathObject(schema, path);
    if (!pathObject) {
        return null;
    }
    const normalizedMethod = method.toLowerCase();
    if (!pathObject[normalizedMethod]) {
        return null;
    }
    return pathObject[normalizedMethod as OpenAPIV3.HttpMethods];
}

function cacheFetcher(fetcher: OpenAPIFetcher): OpenAPIFetcher {
    const cache = new Map<string, Promise<any>>();

    return {
        async fetch(url) {
            if (cache.has(url)) {
                return cache.get(url);
            }

            const promise = fetcher.fetch(url);
            cache.set(url, promise);
            return promise;
        },
        parseMarkdown: fetcher.parseMarkdown,
    };
}

/**
 * Parse a raw string into an OpenAPI document.
 * It will also convert Swagger 2.0 to OpenAPI 3.0.
 * It can throw an `OpenAPIFetchError` if the document is invalid.
 */
export async function parseOpenAPIV3(url: string, text: string): Promise<OpenAPIV3XDocument> {
    // Parse the JSON or YAML
    let data: unknown;

    // Try with JSON
    try {
        data = JSON.parse(text);
    } catch (jsonError) {
        try {
            // Try with YAML
            data = YAML.parse(text);
        } catch (yamlError) {
            if (yamlError instanceof Error && yamlError.name.startsWith('YAML')) {
                throw new OpenAPIFetchError('Failed to parse YAML: ' + yamlError.message, url);
            } else {
                throw yamlError;
            }
        }
    }

    // Convert Swagger 2.0 to OpenAPI 3.0
    // @ts-ignore
    if (data && data.swagger) {
        try {
            // Convert Swagger 2.0 to OpenAPI 3.0
            // @ts-ignore
            const result = (await swagger2openapi.convertObj(data, {
                resolve: false,
                resolveInternal: false,
                laxDefaults: true,
                laxurls: true,
                lint: false,
                prevalidate: false,
                anchors: true,
                patch: true,
            })) as ConvertOutputOptions;

            data = result.openapi;
        } catch (error) {
            if ((error as Error).name === 'S2OError') {
                throw new OpenAPIFetchError(
                    'Failed to convert Swagger 2.0 to OpenAPI 3.0: ' + (error as Error).message,
                    url,
                );
            } else {
                throw error;
            }
        }
    }

    // @ts-ignore
    return data;
}

export class OpenAPIFetchError extends Error {
    public name = 'OpenAPIFetchError';

    constructor(
        message: string,
        public readonly url: string,
    ) {
        super(message);
    }
}
