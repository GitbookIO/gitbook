import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type { ApiClientConfiguration } from '@scalar/types';
import type { OpenAPIOperationData } from '../types';

export type TryItPrefillExpressionResolver = (expr: string) => string | undefined;

export interface TryItPrefillConfiguration {
    authentication?: ApiClientConfiguration['authentication'];
    servers?: ApiClientConfiguration['servers'];
}

/**
 * Resolve the Scalar API client prefill configuration for a given OpenAPI operation.
 */
export function resolveTryItPrefillForOperation(args: {
    /**
     * The parsed OpenAPI operation.
     */
    operation: Pick<OpenAPIOperationData, 'securities' | 'servers'>;
    /**
     * Function to resolve a user-defined expression contained in a try it prefill extension attribute,
     * e.g:
     *
     * x-gitbook-tryit-prefill: {{ visitor.claims.apiKey }}
     */
    resolveTryItPrefillExpression: TryItPrefillExpressionResolver;
}): TryItPrefillConfiguration {
    const {
        operation: { securities, servers },
        resolveTryItPrefillExpression,
    } = args;
    const prefillAuth = securities
        ? resolveTryItPrefillAuthForOperationSecurities({
              securities,
              resolveTryItPrefillExpression,
          })
        : undefined;
    const prefillServers = servers
        ? resolveTryItPrefillServersForOperationServers({ servers, resolveTryItPrefillExpression })
        : [];

    return {
        ...(prefillAuth ? { authentication: prefillAuth } : {}),
        ...(prefillServers ? { servers: prefillServers } : {}),
    };
}

/**
 * Resolve prefill authentication configuration for the security schemes defined for an operation.
 */
function resolveTryItPrefillAuthForOperationSecurities(args: {
    securities: OpenAPIOperationData['securities'];
    resolveTryItPrefillExpression: TryItPrefillExpressionResolver;
}): ApiClientConfiguration['authentication'] | undefined {
    const { securities, resolveTryItPrefillExpression } = args;
    const prefillAuthConfig: ApiClientConfiguration['authentication']['securitySchemes'] = {};

    for (const [schemeName, security] of Object.values(securities)) {
        const tryitPrefillAuthValue = security['x-gitbook-tryit-prefill']
            ? resolveTryItPrefillExpression(security['x-gitbook-tryit-prefill'])
            : undefined;

        if (!tryitPrefillAuthValue) {
            continue;
        }

        switch (security.type) {
            case 'http': {
                if (security.scheme?.includes('bearer')) {
                    prefillAuthConfig[schemeName] = {
                        token: tryitPrefillAuthValue,
                    };
                } else if (
                    security.scheme?.includes('basic') &&
                    tryitPrefillAuthValue.includes(':')
                ) {
                    const [username, password] = tryitPrefillAuthValue.split(':', 2);
                    prefillAuthConfig[schemeName] = {
                        username,
                        password,
                    };
                }
                break;
            }
            case 'apiKey': {
                prefillAuthConfig[schemeName] = {
                    name: security.name,
                    in: security.in,
                    value: tryitPrefillAuthValue,
                };
                break;
            }
            // TODO: Add support for oauth2/openIdConnect schemes.
            case 'oauth2':
            case 'openIdConnect': {
                break;
            }
        }
    }

    return Object.keys(prefillAuthConfig).length > 0
        ? {
              securitySchemes: prefillAuthConfig,
          }
        : undefined;
}

/**
 * Resolve prefill server configuration for the servers defined for an operation.
 */
function resolveTryItPrefillServersForOperationServers(args: {
    servers: OpenAPIOperationData['servers'];
    resolveTryItPrefillExpression: TryItPrefillExpressionResolver;
}): ApiClientConfiguration['servers'] | undefined {
    const { servers, resolveTryItPrefillExpression } = args;
    const resolvedServers: ApiClientConfiguration['servers'] = [];

    for (const server of servers) {
        // Url-level prefill
        const tryItPrefillServerUrlExpr = server['x-gitbook-tryit-prefill'];
        const tryItPrefillServerUrlValue = tryItPrefillServerUrlExpr
            ? resolveTryItPrefillExpression(tryItPrefillServerUrlExpr)
            : undefined;

        const variables: { [variable: string]: OpenAPIV3.ServerVariableObject } = server.variables
            ? { ...server.variables }
            : {};

        // Variable-level prefill
        if (server.variables) {
            for (const [varName, variable] of Object.entries(server.variables)) {
                const { 'x-gitbook-tryit-prefill': tryItPrefillVarExpr, ...variableProps } =
                    variable;

                const tryItPrefillVarValue = tryItPrefillVarExpr
                    ? resolveTryItPrefillExpression(tryItPrefillVarExpr)
                    : undefined;
                variables[varName] = {
                    ...variableProps,
                    ...(tryItPrefillVarValue ? { default: String(tryItPrefillVarValue) } : {}),
                };
            }
        }

        const hasServerVariables = Object.keys(variables).length > 0;
        if (server.url && (tryItPrefillServerUrlValue || hasServerVariables)) {
            const resolvedServer: OpenAPIV3.ServerObject = {
                url: tryItPrefillServerUrlValue ?? server.url,
                ...(server.description ? { description: server.description } : {}),
                ...(hasServerVariables ? { variables } : {}),
            };
            resolvedServers.push(resolvedServer);
        }
    }

    return resolvedServers.length > 0 ? resolvedServers : undefined;
}
