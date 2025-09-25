import { ExpressionRuntime, type TemplatePart, parseTemplate } from '@gitbook/expr';
import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import type { ApiClientConfiguration } from '@scalar/types';
import type { PrefillInputContextData } from '../OpenAPIPrefillContextProvider';
import type {
    OpenAPIOperationData,
    OpenAPISecuritySchemeWithRequired,
    OpenAPIServerWithCustomProperties,
} from '../types';

export interface TryItPrefillConfiguration {
    authentication?: ApiClientConfiguration['authentication'];
    servers?: ApiClientConfiguration['servers'];
}

export const PREFILL_CUSTOM_PROPERTY = 'x-gitbook-prefill';

/**
 * Resolve the Scalar API client prefill configuration for a given OpenAPI operation.
 */
export function resolveTryItPrefillForOperation(args: {
    /**
     * The parsed OpenAPI operation.
     */
    operation: Pick<OpenAPIOperationData, 'securities' | 'servers'>;
    /**
     * Prefill input context data.
     */
    prefillInputContext: PrefillInputContextData | null;
}): TryItPrefillConfiguration {
    const {
        operation: { securities, servers },
        prefillInputContext,
    } = args;

    if (!prefillInputContext) {
        return {};
    }

    const runtime = new ExpressionRuntime();
    const resolveTryItPrefillExpression = (expr: string) => {
        const parts = parseTemplate(expr);
        if (!parts.length) {
            return undefined;
        }
        return runtime.evaluateTemplate(expr, prefillInputContext);
    };

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
    resolveTryItPrefillExpression: (expr: string) => string | undefined;
}): ApiClientConfiguration['authentication'] | undefined {
    const { securities, resolveTryItPrefillExpression } = args;
    const prefillAuthConfig: ApiClientConfiguration['authentication']['securitySchemes'] = {};

    for (const [schemeName, security] of Object.values(securities)) {
        const tryitPrefillAuthValue = security[PREFILL_CUSTOM_PROPERTY]
            ? resolveTryItPrefillExpression(security[PREFILL_CUSTOM_PROPERTY])
            : undefined;

        if (!tryitPrefillAuthValue) {
            continue;
        }

        switch (security.type) {
            case 'http': {
                if (security.scheme?.includes('bearer')) {
                    prefillAuthConfig[schemeName] = { token: tryitPrefillAuthValue };
                } else if (
                    security.scheme?.includes('basic') &&
                    tryitPrefillAuthValue.includes(':')
                ) {
                    const [username, password] = tryitPrefillAuthValue.split(':', 2);
                    prefillAuthConfig[schemeName] = { username, password };
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
            case 'oauth2':
            case 'openIdConnect': {
                break;
            }
        }
    }

    return Object.keys(prefillAuthConfig).length > 0
        ? { securitySchemes: prefillAuthConfig }
        : undefined;
}

/**
 * Resolve prefill server configuration for the servers defined for an operation.
 */
function resolveTryItPrefillServersForOperationServers(args: {
    servers: OpenAPIOperationData['servers'];
    resolveTryItPrefillExpression: (expr: string) => string | undefined;
}): ApiClientConfiguration['servers'] | undefined {
    const { servers, resolveTryItPrefillExpression } = args;
    const resolvedServers: ApiClientConfiguration['servers'] = [];

    for (const server of servers) {
        // Url-level prefill
        const tryItPrefillServerUrlExpr = server[PREFILL_CUSTOM_PROPERTY];
        const tryItPrefillServerUrlValue = tryItPrefillServerUrlExpr
            ? resolveTryItPrefillExpression(tryItPrefillServerUrlExpr)
            : undefined;

        const variables: { [variable: string]: OpenAPIV3.ServerVariableObject } = server.variables
            ? { ...server.variables }
            : {};

        // Variable-level prefill
        if (server.variables) {
            for (const [varName, variable] of Object.entries(server.variables)) {
                const { [PREFILL_CUSTOM_PROPERTY]: tryItPrefillVarExpr, ...variableProps } =
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

/**
 * Return a X-GITBOOK-PREFILL placeholder based on the prefill custom property in the provided security scheme.
 */
export function resolvePrefillCodePlaceholderFromSecurityScheme(args: {
    security: OpenAPISecuritySchemeWithRequired;
    defaultPlaceholderValue?: string;
}) {
    const { security, defaultPlaceholderValue } = args;
    const prefillExprParts = extractPrefillExpressionPartsFromSecurityScheme(security);

    if (prefillExprParts.length === 0) {
        return defaultPlaceholderValue ?? '';
    }
    const prefillExpr = templatePartsToExpression(prefillExprParts);

    return toPrefillCodePlaceholder(prefillExpr, defaultPlaceholderValue);
}

function extractPrefillExpressionPartsFromSecurityScheme(
    security: OpenAPISecuritySchemeWithRequired
): TemplatePart[] {
    const expression = security[PREFILL_CUSTOM_PROPERTY];

    if (!expression || expression.length === 0) {
        return [];
    }

    return parseTemplate(expression);
}

/**
 * Return a server URL with X-GITBOOK-PREFILL placeholders based on the prefill custom properties in the provided security scheme.
 */
export function resolveURLWithPrefillCodePlaceholdersFromServer(
    server: OpenAPIServerWithCustomProperties,
    defaultServerUrl?: string
): string {
    const serverVariables = server.variables ?? {};
    const variableExprs: Record<string, string> = {};
    let hasVariablePrefill = false;

    for (const [name, variable] of Object.entries(serverVariables ?? {})) {
        if (variable[PREFILL_CUSTOM_PROPERTY]) {
            hasVariablePrefill = true;
            const exprString = templatePartsToExpression(
                parseTemplate(variable[PREFILL_CUSTOM_PROPERTY])
            );
            variableExprs[name] = `(${exprString} ?? '${variable.default ?? ''}')`;
        } else {
            variableExprs[name] = String(variable.default) ?? '';
        }
    }

    let interpolatedUrl = server.url ?? '';
    interpolatedUrl = interpolatedUrl.replace(/{([^}]+)}/g, (_, varName: string) => {
        const expr = variableExprs[varName];
        if (serverVariables[varName]?.[PREFILL_CUSTOM_PROPERTY]) {
            return `\${${expr ?? `'${varName}'`}}`;
        }
        return expr ?? `{${varName}}`;
    });

    const interpolatedUrlTemplate = hasVariablePrefill ? `\`${interpolatedUrl}\`` : interpolatedUrl;

    const urlLevelExpr = server[PREFILL_CUSTOM_PROPERTY];
    if (urlLevelExpr) {
        const exprString = templatePartsToExpression(parseTemplate(urlLevelExpr));
        const defaultValue = hasVariablePrefill
            ? interpolatedUrlTemplate
            : `'${interpolatedUrlTemplate}'`;
        return toPrefillCodePlaceholder(`${exprString} ?? ${defaultValue}`, defaultServerUrl);
    }

    if (hasVariablePrefill) {
        return toPrefillCodePlaceholder(interpolatedUrlTemplate, defaultServerUrl);
    }

    return interpolatedUrl;
}

function templatePartsToExpression(parts: ReturnType<typeof parseTemplate>) {
    return parts
        .map((part) => {
            switch (part.type) {
                case 'text':
                    return `"${part.value}"`;
                case 'expression':
                    return part.value;
                default:
                    return '';
            }
        })
        .join(' + ');
}

function toPrefillCodePlaceholder(expression: string, defaultValue?: string) {
    return `$$__X-GITBOOK-PREFILL[(${expression})${defaultValue ? ` ?? '${defaultValue}'` : ''}]__$$`;
}
