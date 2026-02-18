import type {
    Filesystem,
    OpenAPIV3,
    OpenAPIV3_1,
    OpenAPIV3xDocument,
} from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from './dereference';
import type { OpenAPIOperationData, OpenAPISecurityScope } from './types';
import { checkIsReference } from './utils';

export { fromJSON, toJSON } from 'flatted';

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

    const servers = getServers(schema, path, operation);
    const schemaSecurity = Array.isArray(schema.security)
        ? schema.security
        : schema.security
          ? [schema.security]
          : [];
    const security: OpenAPIV3_1.SecurityRequirementObject[] = operation.security ?? schemaSecurity;

    // If security includes an empty object, it means that the security is optional
    const isOptionalSecurity = security.some((entry) => Object.keys(entry).length === 0);
    const flatSecurities = flattenSecurities(security);

    // Resolve securities
    const securitiesMap = new Map<string, OpenAPIOperationData['securities'][number][1]>();
    for (const entry of flatSecurities) {
        const [securityKey, operationScopes] = Object.entries(entry)[0] ?? [];
        if (securityKey) {
            const securityScheme = schema.components?.securitySchemes?.[securityKey];
            const scopes = resolveSecurityScopes({
                securityScheme,
                operationScopes,
            });
            const existing = securitiesMap.get(securityKey);
            const mergedScopes = mergeSecurityScopes(existing?.scopes ?? null, scopes);
            securitiesMap.set(securityKey, {
                ...securityScheme,
                required: !isOptionalSecurity,
                scopes: mergedScopes,
            });
        }
    }

    return {
        servers,
        operation: { ...operation, security },
        method,
        path,
        securities: Array.from(securitiesMap.entries()),
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
    return schema.paths?.[path] || null;
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
 * Resolve servers for an operation following OpenAPI precedence rules.
 * Per the spec, only the lowest-level servers array is used: operation > path > root.
 */
function getServers(
    schema: OpenAPIV3.Document | OpenAPIV3_1.Document,
    path: string,
    operation: OpenAPIV3.OperationObject
): OpenAPIV3.ServerObject[] {
    if ('servers' in operation && operation.servers) {
        return operation.servers;
    }

    const pathObject = getPathObject(schema, path);
    if (pathObject && 'servers' in pathObject && pathObject.servers) {
        return pathObject.servers;
    }

    return 'servers' in schema ? (schema.servers ?? []) : [];
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

/**
 * Resolve the scopes for a security scheme.
 */
function resolveSecurityScopes({
    securityScheme,
    operationScopes,
}: {
    securityScheme?: OpenAPIV3.ReferenceObject | OpenAPIV3.SecuritySchemeObject;
    operationScopes?: string[];
}): OpenAPISecurityScope[] | null {
    if (!operationScopes?.length || !securityScheme || checkIsReference(securityScheme)) {
        return null;
    }

    // If the security scheme is an OAuth or OpenID Connect security scheme, we first check if the operation scopes are defined in the security scheme
    if (isOAuthSecurityScheme(securityScheme)) {
        const flows = securityScheme.flows ? Object.entries(securityScheme.flows) : [];

        return flows.flatMap(([_, flow]) => {
            return Object.entries(flow.scopes ?? {}).filter(([scope]) =>
                operationScopes.includes(scope)
            );
        });
    }

    return operationScopes.map((scope) => [scope, undefined]);
}

function mergeSecurityScopes(
    existing: OpenAPISecurityScope[] | null,
    incoming: OpenAPISecurityScope[] | null
): OpenAPISecurityScope[] | null {
    if (!existing?.length) {
        return incoming;
    }
    if (!incoming?.length) {
        return existing;
    }

    const seen = new Set<string>();
    const merged: OpenAPISecurityScope[] = [];

    for (const scope of [...existing, ...incoming]) {
        if (seen.has(scope[0])) {
            continue;
        }
        seen.add(scope[0]);
        merged.push(scope);
    }

    return merged;
}

/**
 * Check if a security scheme is an OAuth or OpenID Connect security scheme.
 */
function isOAuthSecurityScheme(
    securityScheme: OpenAPIV3.SecuritySchemeObject
): securityScheme is OpenAPIV3.OAuth2SecurityScheme {
    return securityScheme.type === 'oauth2';
}
