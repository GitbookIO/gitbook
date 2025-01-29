import { toJSON, fromJSON } from 'flatted';
import YAML from 'yaml';
import swagger2openapi, { ConvertOutputOptions } from 'swagger2openapi';

import { OpenAPICustomSpecProperties, OpenAPIFetcher } from './types';
import { dereference, validate, traverse, AnyObject } from '@scalar/openapi-parser';
import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { noReference } from './utils';

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3_1.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3_1.SecuritySchemeObject][];
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

    const schema = await fetcher.fetch(input.url);

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

    const servers = 'servers' in schema ? (schema.servers ?? []) : [];
    const security = operation.security ?? schema.security ?? [];

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
            typeof schema['x-codeSamples'] === 'boolean' ? schema['x-codeSamples'] : undefined,
        'x-hideTryItPanel':
            typeof schema['x-hideTryItPanel'] === 'boolean'
                ? schema['x-hideTryItPanel']
                : undefined,
    };
}

/**
 * Dereference a schema, resolving all references.
 */
async function deferenceSchema<T extends OpenAPIV3_1.Document>(schema: T): Promise<T | null> {
    const result = await dereference(schema);
    if (result.schema) {
        // Dereference will return the same type as the input
        return result.schema as T;
    }
    return null;
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

/**
 * Get a path object from its path.
 */
function getPathObject(
    schema: OpenAPIV3_1.Document,
    path: string,
): OpenAPIV3_1.PathItemObject | null {
    if (schema.paths?.[path]) {
        return schema.paths[path];
    }
    return null;
}

/**
 * Resolve parameters from a path in an OpenAPI schema.
 */
function getPathObjectParameter(
    schema: OpenAPIV3_1.Document,
    path: string,
): OpenAPIV3_1.ParameterObject[] | null {
    const pathObject = getPathObject(schema, path);
    if (pathObject?.parameters) {
        return pathObject.parameters.map(noReference);
    }
    return null;
}

/**
 * Get an operation by its path and method.
 */
function getOperationByPathAndMethod(
    schema: OpenAPIV3_1.Document,
    path: string,
    method: string,
): OpenAPIV3.OperationObject | null {
    // Types are buffy for OpenAPIV3_1.OperationObject, so we use v3
    const pathObject = getPathObject(schema, path);
    if (!pathObject) {
        return null;
    }
    const normalizedMethod = method.toLowerCase();
    if (!pathObject[normalizedMethod]) {
        return null;
    }
    return pathObject[normalizedMethod];
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
export async function parseOpenAPIV3(
    url: string,
    text: string,
): Promise<OpenAPIV3_1.Document<OpenAPICustomSpecProperties>> {
    const validationResult = await validate(text);

    // Spec is invalid, we stop here.
    if (!validationResult.valid || !validationResult.schema) {
        throw new OpenAPIFetchError('Invalid OpenAPI document', url);
    }

    let { schema } = validationResult;

    const v3Schema = await (async () => {
        // Convert Swagger 2.0 to OpenAPI 3.0
        if (checkIsOpenAPIV2(schema)) {
            try {
                // @ts-expect-error Types are incompatible between the two libraries
                const result = (await swagger2openapi.convertObj(schema, {
                    resolve: false,
                    resolveInternal: false,
                    laxDefaults: true,
                    laxurls: true,
                    lint: false,
                    prevalidate: false,
                    anchors: true,
                    patch: true,
                })) as ConvertOutputOptions;

                return result.openapi as OpenAPIV3_1.Document<OpenAPICustomSpecProperties>;
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
        return schema as OpenAPIV3_1.Document<OpenAPICustomSpecProperties>;
    })();

    const v3UnrefSchema = await deferenceSchema(v3Schema);

    // No schema, we stop here.
    if (!v3UnrefSchema) {
        throw new OpenAPIFetchError('Failed to dereference OpenAPI document', url);
    }

    return v3UnrefSchema;
}

/**
 * Check if the schema is an OpenAPI v2 schema.
 */
function checkIsOpenAPIV2(schema: OpenAPI.Document): schema is OpenAPIV2.Document {
    return Boolean('swagger' in schema && schema.swagger);
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
