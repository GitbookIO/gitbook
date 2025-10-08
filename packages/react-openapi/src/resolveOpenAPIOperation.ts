import { fromJSON, toJSON } from 'flatted';

import type {
    Filesystem,
    OpenAPIV3,
    OpenAPIV3_1,
    OpenAPIV3xDocument,
} from '@gitbook/openapi-parser';
import { dereferenceFilesystem } from './dereference';
import type { OpenAPIOperationData, OpenAPISecurityScope } from './types';
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
    const securities: OpenAPIOperationData['securities'] = [];
    for (const entry of flatSecurities) {
        const [securityKey, operationScopes] = Object.entries(entry)[0] ?? [];
        if (securityKey) {
            const securityScheme = schema.components?.securitySchemes?.[securityKey];
            const scopes = resolveSecurityScopes({
                securityScheme,
                operationScopes,
            });
            securities.push([
                securityKey,
                {
                    ...securityScheme,
                    required: !isOptionalSecurity,
                    scopes,
                },
            ]);
        }
    }

    return {
        servers,
        operation: { ...operation, security },
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
}): OpenAPISecurityScope[] {
    if (!securityScheme || checkIsReference(securityScheme)) {
        return [];
    }

    if (isOAuthSecurityScheme(securityScheme) && securityScheme.flows) {
        return resolveOAuth2Scopes(securityScheme.flows, operationScopes);
    }

    return operationScopes?.map((scope) => [scope, undefined]) || [];
}

/**
 * Resolve the scopes for an OAuth2 security scheme.
 */
function resolveOAuth2Scopes(
    flows: NonNullable<OpenAPIV3.OAuth2SecurityScheme['flows']>,
    operationScopes?: string[]
): OpenAPISecurityScope[] {
    const flowValues = Object.values(flows);

    // Return all operation scopes if no flow scopes are provided
    if (!flowValues.length) {
        return operationScopes?.map((scope) => [scope, undefined]) || [];
    }

    // Return all flow scopes if no operation scopes are provided
    if (!operationScopes?.length) {
        return flowValues.flatMap((flow) => Object.entries(flow.scopes ?? {}));
    }

    // Merge the operation scopes with the flow scopes if both are provided
    return flowValues.flatMap((flow): OpenAPISecurityScope[] => {
        if (flow.scopes) {
            return operationScopes.map((scope) => {
                const flowScope = flow.scopes?.[scope];
                return [scope, flowScope];
            });
        }
        return [];
    });
}

/**
 * Check if a security scheme is an OAuth or OpenID Connect security scheme.
 */
function isOAuthSecurityScheme(
    securityScheme: OpenAPIV3.SecuritySchemeObject
): securityScheme is OpenAPIV3.OAuth2SecurityScheme {
    return securityScheme.type === 'oauth2';
}
