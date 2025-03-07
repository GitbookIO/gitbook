import { fromJSON, toJSON } from 'flatted';

import type {
    Filesystem,
    OpenAPIV3,
    OpenAPIV3_1,
    OpenAPIV3xDocument,
} from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from './dereference';
import type { OpenAPIOperationData } from './types';
import { checkIsReference } from './utils';

export { fromJSON, toJSON };

/**
 * Resolve an OpenAPI operation in a file and compile it to a more usable format.
 */
export async function resolveOpenAPIOperation(
    filesystem: Filesystem<OpenAPIV3xDocument>,
    operationDescriptor: {
        path: string;
        method: string;
    }
): Promise<OpenAPIOperationData | null> {
    const { path, method } = operationDescriptor;
    const schema = await dereferenceFilesystem(filesystem);
    let operation = getOperationByPathAndMethod(schema, path, method);

    if (!operation) {
        return null;
    }

    // Resolve common parameters
    const commonParameters = getPathObjectParameter(schema, path);
    if (commonParameters) {
        operation = {
            ...operation,
            parameters: [...commonParameters, ...(operation.parameters ?? [])],
        };
    }

    const servers = 'servers' in schema ? (schema.servers ?? []) : [];
    const security = flattenSecurities(operation.security ?? schema.security ?? []);

    // Resolve securities
    const securities: OpenAPIOperationData['securities'] = [];
    for (const entry of security) {
        const securityKey = Object.keys(entry)[0];
        if (securityKey) {
            const securityScheme = schema.components?.securitySchemes?.[securityKey];
            if (securityScheme && !checkIsReference(securityScheme)) {
                securities.push([securityKey, securityScheme]);
            }
        }
    }

    return {
        servers,
        operation,
        method,
        path,
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
 * Get a path object from its path.
 */
function getPathObject(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    path: string
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
    path: string
):
    | (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
    | (OpenAPIV3.ParameterObject | OpenAPIV3_1.ReferenceObject)[]
    | null {
    const pathObject = getPathObject(schema, path);
    if (pathObject?.parameters) {
        return pathObject.parameters;
    }
    return null;
}

/**
 * Get an operation by its path and method.
 */
function getOperationByPathAndMethod(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    path: string,
    method: string
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

/**
 * Flatten security objects in case they are nested.
 * @example [{bearerAuth:[], basicAuth:[]}] => [{ bearerAuth: [] }, { basicAuth: [] }]
 */
function flattenSecurities(security: OpenAPIV3.SecurityRequirementObject[]) {
    if (!Array.isArray(security) || security.length === 0) {
        return [];
    }

    return security.flatMap((securityObject) => {
        return Object.entries(securityObject).map(([authType, config]) => ({
            [authType]: config,
        }));
    });
}
