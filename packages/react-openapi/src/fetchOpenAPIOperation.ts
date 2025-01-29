import { toJSON, fromJSON } from 'flatted';

import { OpenAPICustomSpecProperties } from './parser';
import { traverse, AnyObject } from '@scalar/openapi-parser';
import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types';
import { noReference } from './utils';

export interface OpenAPIFetcher {
    /**
     * Fetch an OpenAPI file by its URL. It should return a fully parsed OpenAPI v3 document.
     */
    fetch: (
        url: string,
    ) => Promise<
        | OpenAPIV3_1.Document<OpenAPICustomSpecProperties>
        | OpenAPIV3.Document<OpenAPICustomSpecProperties>
    >;

    /**
     * Parse markdown to the react element to render.
     */
    parseMarkdown?: (input: string) => Promise<string>;
}

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject;

    /** Securities that should be used for this operation */
    securities: [string, OpenAPIV3.SecuritySchemeObject][];
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
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    path: string,
): OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject | null {
    if (schema.paths?.[path]) {
        return schema.paths[path];
    }
    return null;
}

/**
 * Resolve parameters from a path in an OpenAPI schema.
 */
function getPathObjectParameter(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    path: string,
): OpenAPIV3.ParameterObject[] | OpenAPIV3_1.ParameterObject[] | null {
    const pathObject = getPathObject(schema, path);
    if (pathObject?.parameters) {
        return pathObject.parameters.map(noReference) as
            | OpenAPIV3.ParameterObject[]
            | OpenAPIV3_1.ParameterObject[];
    }
    return null;
}

/**
 * Get an operation by its path and method.
 */
function getOperationByPathAndMethod(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
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
