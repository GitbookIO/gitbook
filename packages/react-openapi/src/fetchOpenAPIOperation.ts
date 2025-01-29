import { toJSON, fromJSON } from 'flatted';
import YAML from 'yaml';
import swagger2openapi, { ConvertOutputOptions } from 'swagger2openapi';

import { OpenAPIFetcher } from './types';
import { dereference, validate, traverse, AnyObject } from '@scalar/openapi-parser';
import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { noReference } from './utils';

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPI.Operation & OpenAPICustomOperationProperties;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3.SecuritySchemeObject][];
}

/**
 * Custom properties that can be defined at the entire spec level.
 */
export interface OpenAPICustomSpecProperties {
    /**
     * If `true`, code samples will not be displayed.
     * This option can be used to hide code samples for the entire spec.
     */
    'x-codeSamples'?: boolean;

    /**
     * If `true`, the "Try it" button will not be displayed.
     * This option can be used to hide code samples for the entire spec.
     */
    'x-hideTryItPanel'?: boolean;
}

/**
 * Custom properties that can be defined at the operation level.
 * These properties are not part of the OpenAPI spec.
 */
export interface OpenAPICustomOperationProperties {
    'x-code-samples'?: OpenAPICustomCodeSample[];
    'x-codeSamples'?: OpenAPICustomCodeSample[] | false;
    'x-custom-examples'?: OpenAPICustomCodeSample[];

    /**
     * If `true`, the "Try it" button will not be displayed.
     * https://redocly.com/docs/api-reference-docs/specification-extensions/x-hidetryitpanel/
     */
    'x-hideTryItPanel'?: boolean;
}

/**
 * Custom code samples that can be defined at the operation level.
 * It follows the spec defined by Redocly.
 * https://redocly.com/docs/api-reference-docs/specification-extensions/x-code-samples/
 */
export interface OpenAPICustomCodeSample {
    lang: string;
    label: string;
    source: string;
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

    const { schema } = await dereference(specData);

    // No schema, we stop here.
    if (!schema) {
        throw new Error(`Schema undefined following the dereference operation: ${input.url}`);
    }

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

    const servers: OpenAPIV3.ServerObject[] = 'servers' in schema ? (schema.servers ?? []) : [];
    const security: OpenAPIV3.SecurityRequirementObject[] =
        operation.security ?? schema.security ?? [];

    // Resolve securities
    const securities: OpenAPIOperationData['securities'] = [];
    for (const entry of security) {
        const securityKey = Object.keys(entry)[0];
        const securityScheme = (schema as OpenAPIV3.Document).components?.securitySchemes?.[
            securityKey
        ];
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

type PathItemObject = Record<
    string,
    OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject
>;

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

/**
 * Get a path object from its path.
 */
function getPathObject(schema: OpenAPI.Document, path: string) {
    if (schema.paths?.[path]) {
        return schema.paths[path] as PathItemObject;
    }
    return null;
}

/**
 * Resolve parameters from a path in an OpenAPI schema.
 */
function getPathObjectParameter(
    schema: OpenAPI.Document,
    path: string,
): OpenAPIV3.ParameterObject[] | null {
    const pathObject = getPathObject(schema, path) as OpenAPIV3.PathItemObject | null;
    if (pathObject?.parameters) {
        return pathObject.parameters.map(noReference);
    }
    return null;
}

/**
 * Get an operation by its path and method.
 */
function getOperationByPathAndMethod(schema: OpenAPI.Document, path: string, method: string) {
    const pathObject = getPathObject(schema, path);
    if (!pathObject) {
        return null;
    }
    const normalizedMethod = method.toLowerCase();
    if (!pathObject[normalizedMethod]) {
        return null;
    }
    return pathObject[normalizedMethod] as OpenAPI.Operation;
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
export async function parseOpenAPIV3(url: string, text: string): Promise<OpenAPIV3.Document> {
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
