import { ExpressionRuntime, type TemplatePart, parseTemplate } from '@gitbook/expr';
import type { OpenAPIV3 } from '@gitbook/openapi-parser';

import type { PrefillInputContextData } from '../OpenAPIPrefillContextProvider';
import type {
    OpenAPICustomSecurityScheme,
    OpenAPIOperationData,
    OpenAPIServerWithCustomProperties,
} from '../types';

export type TryItPrefillAuthValue =
    | { token: string }
    | { username: string | undefined; password: string | undefined }
    | { name: string | undefined; in: string | undefined; value: string };

export interface TryItPrefillConfiguration {
    authentication?: { securitySchemes: Record<string, TryItPrefillAuthValue> };
    servers?: OpenAPIV3.ServerObject[];
}

export const PREFILL_CUSTOM_PROPERTY = 'x-gitbook-prefill';

/**
 * Resolve the Try it prefill configuration for a given OpenAPI operation.
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

    const resolveTryItPrefillExpression = createPrefillExpressionResolver(prefillInputContext);

    const prefillAuth = securities
        ? resolveTryItPrefillAuthForOperationSecurities({
              securities,
              resolveTryItPrefillExpression,
          })
        : undefined;

    const prefillServers = servers
        ? resolveTryItPrefillServersForOperationServers({
              servers,
              resolveTryItPrefillExpression,
          })
        : [];

    return {
        ...(prefillAuth ? { authentication: prefillAuth } : {}),
        ...(prefillServers ? { servers: prefillServers } : {}),
    };
}

function createPrefillExpressionResolver(
    prefillInputContext: PrefillInputContextData | null
): ((expr: string) => string | undefined) | undefined {
    if (!prefillInputContext) {
        return undefined;
    }
    const runtime = new ExpressionRuntime();
    return (expr: string) => {
        const parts = parseTemplate(expr);
        if (!parts.length) {
            return undefined;
        }
        return runtime.evaluateTemplate(expr, prefillInputContext);
    };
}

/**
 * Resolve prefill authentication configuration for the security schemes defined for an operation.
 */
function resolveTryItPrefillAuthForOperationSecurities(args: {
    securities: OpenAPIOperationData['securities'];
    resolveTryItPrefillExpression?: (expr: string) => string | undefined;
}): TryItPrefillConfiguration['authentication'] | undefined {
    const { securities, resolveTryItPrefillExpression } = args;
    const prefillAuthConfig: Record<string, TryItPrefillAuthValue> = {};

    for (const [schemeName, security] of Object.values(securities)) {
        const resolvedPrefill = security[PREFILL_CUSTOM_PROPERTY]
            ? resolveTryItPrefillExpression?.(security[PREFILL_CUSTOM_PROPERTY])
            : undefined;
        const tryitPrefillAuthValue =
            resolvedPrefill || security['x-gitbook-token-placeholder'] || undefined;

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
    resolveTryItPrefillExpression?: (expr: string) => string | undefined;
}): TryItPrefillConfiguration['servers'] | undefined {
    const resolvedServers = args.servers
        .map((server) => resolveTryItPrefillServer(server, args.resolveTryItPrefillExpression))
        .filter((resolved) => resolved.prefilled)
        .map((resolved) => resolved.server);

    return resolvedServers.length > 0 ? resolvedServers : undefined;
}

/**
 * Resolve every server of an operation with its prefilled URL and variable defaults applied.
 */
export function resolveTryItServers(args: {
    servers: OpenAPIOperationData['servers'];
    prefillInputContext: PrefillInputContextData | null;
}): OpenAPIV3.ServerObject[] {
    const resolveExpression = createPrefillExpressionResolver(args.prefillInputContext);
    return args.servers.map(
        (server) => resolveTryItPrefillServer(server, resolveExpression).server
    );
}

function resolveTryItPrefillServer(
    server: OpenAPIOperationData['servers'][number],
    resolveTryItPrefillExpression: ((expr: string) => string | undefined) | undefined
): { server: OpenAPIV3.ServerObject; prefilled: boolean } {
    // Url-level prefill
    const tryItPrefillServerUrlExpr = server[PREFILL_CUSTOM_PROPERTY];
    const tryItPrefillServerUrlValue =
        tryItPrefillServerUrlExpr && resolveTryItPrefillExpression
            ? resolveTryItPrefillExpression(tryItPrefillServerUrlExpr)
            : undefined;

    const variables: { [variable: string]: OpenAPIV3.ServerVariableObject } = {};

    // Variable-level prefill
    for (const [varName, variable] of Object.entries(server.variables ?? {})) {
        const { [PREFILL_CUSTOM_PROPERTY]: tryItPrefillVarExpr, ...variableProps } = variable;

        const tryItPrefillVarValue = tryItPrefillVarExpr
            ? resolveTryItPrefillExpression?.(tryItPrefillVarExpr)
            : undefined;
        variables[varName] = {
            ...variableProps,
            ...(tryItPrefillVarValue ? { default: String(tryItPrefillVarValue) } : {}),
        };
    }

    const hasServerVariables = Object.keys(variables).length > 0;
    return {
        server: {
            url: tryItPrefillServerUrlValue ?? server.url ?? '',
            ...(server.description ? { description: server.description } : {}),
            ...(hasServerVariables ? { variables } : {}),
        },
        prefilled: Boolean(server.url && (tryItPrefillServerUrlValue || hasServerVariables)),
    };
}

/**
 * Return a X-GITBOOK-PREFILL placeholder based on the prefill custom property in the provided security scheme.
 */
export function resolvePrefillCodePlaceholderFromSecurityScheme(args: {
    security: OpenAPICustomSecurityScheme;
    defaultPlaceholderValue?: string;
}) {
    const { security, defaultPlaceholderValue } = args;
    const prefillExprParts = extractPrefillExpressionPartsFromSecurityScheme(security);

    if (prefillExprParts.length === 0) {
        // If no x-gitbook-prefill, check for x-gitbook-token-placeholder
        if (security['x-gitbook-token-placeholder']) {
            return security['x-gitbook-token-placeholder'];
        }
        return defaultPlaceholderValue ?? '';
    }
    const prefillExpr = templatePartsToExpression(prefillExprParts);

    return toPrefillCodePlaceholder(prefillExpr, defaultPlaceholderValue);
}

function extractPrefillExpressionPartsFromSecurityScheme(
    security: OpenAPICustomSecurityScheme
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
    return `$$__X-GITBOOK-PREFILL[(${expression})${
        defaultValue ? ` ?? '${defaultValue}'` : ''
    }]__$$`;
}
