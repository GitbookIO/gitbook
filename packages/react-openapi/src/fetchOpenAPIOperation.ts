import { toJSON, fromJSON } from 'flatted';

import {
    type OpenAPICustomOperationProperties,
    type OpenAPICustomSpecProperties,
    type OpenAPIV3xDocument,
    type Filesystem,
    type OpenAPIV3,
    type OpenAPIV3_1,
    OpenAPIParseError,
    dereference,
} from '@gitbook/openapi-parser';
import { noReference } from './utils';

export interface OpenAPIFetcher {
    /**
     * Fetch an OpenAPI file by its URL. It should return a fully parsed OpenAPI v3 document.
     */
    fetch: (url: string) => Promise<Filesystem<OpenAPIV3xDocument>>;
}

export interface OpenAPIOperationData extends OpenAPICustomSpecProperties {
    path: string;
    method: string;

    /** Servers to be used for this operation */
    servers: OpenAPIV3.ServerObject[];

    /** Spec of the operation */
    operation: OpenAPIV3.OperationObject<OpenAPICustomOperationProperties>;

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
    fetcher: OpenAPIFetcher,
): Promise<OpenAPIOperationData | null> {
    const filesystem = await fetcher.fetch(input.url);
    const schema = await memoDereferenceFilesystem(filesystem, input.url);
    let operation = getOperationByPathAndMethod(schema, input.path, input.method);

    if (!operation) {
        return null;
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
        if (securityKey) {
            const securityScheme = schema.components?.securitySchemes?.[securityKey];
            if (securityScheme) {
                securities.push([securityKey, noReference(securityScheme)]);
            }
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

const dereferenceCache = new WeakMap<Filesystem, Promise<OpenAPIV3xDocument>>();

/**
 * Memoized version of `dereferenceSchema`.
 */
function memoDereferenceFilesystem(
    filesystem: Filesystem,
    url: string,
): Promise<OpenAPIV3xDocument> {
    if (dereferenceCache.has(filesystem)) {
        return dereferenceCache.get(filesystem) as Promise<OpenAPIV3xDocument>;
    }

    const promise = dereferenceFilesystem(filesystem, url);
    dereferenceCache.set(filesystem, promise);
    return promise;
}

/**
 * Dereference an OpenAPI schema.
 */
async function dereferenceFilesystem(
    filesystem: Filesystem,
    url: string,
): Promise<OpenAPIV3xDocument> {
    const result = await dereference(filesystem);

    if (!result.schema) {
        throw new OpenAPIParseError(
            'Failed to dereference OpenAPI document',
            url,
            'failed-dereference',
        );
    }

    return result.schema as OpenAPIV3xDocument;
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
