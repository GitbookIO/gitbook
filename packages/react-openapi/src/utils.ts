import { OpenAPIV3 } from 'openapi-types';

export function noReference<T>(input: T | OpenAPIV3.ReferenceObject): T {
    if (typeof input === 'object' && !!input && '$ref' in input) {
        throw new Error('Reference found');
    }

    return input;
}

export function createStateKey(key: string, scope?: string) {
    return scope ? `${scope}_${key}` : key;
}

/**
 * Get the default URL for the server.
 */
export function getServersURL(
    servers: OpenAPIV3.ServerObject[],
    selectors?: Record<string, string>,
): string {
    const serverIndex =
        selectors && !isNaN(Number(selectors.server)) ? Number(selectors.server) : 0;
    const server = servers[serverIndex];
    const parts = parseServerURL(server?.url ?? '');

    return parts
        .map((part) => {
            if (part.kind === 'text') {
                return part.text;
            } else {
                return selectors && !isNaN(Number(selectors[part.name]))
                    ? server.variables?.[part.name]?.enum?.[Number(selectors[part.name])]
                    : (server.variables?.[part.name]?.default ?? `{${part.name}}`);
            }
        })
        .join('');
}

export function parseServerURL(url: string) {
    const parts = url.split(/{([^}]+)}/g);
    const result: Array<{ kind: 'variable'; name: string } | { kind: 'text'; text: string }> = [];
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            result.push({ kind: 'text', text: parts[i] });
        } else {
            result.push({ kind: 'variable', name: parts[i] });
        }
    }
    return result;
}
