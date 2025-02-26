import type { OpenAPIV3 } from '@gitbook/openapi-parser';

/**
 * Get the default URL for the server.
 */
export function getDefaultServerURL(servers: OpenAPIV3.ServerObject[]): string {
    const server = servers[0];
    if (!server) {
        // Return empty string if no server is found to display nothing
        return '';
    }

    return interpolateServerURL(server);
}

/**
 * Interpolate the server URL with the default values of the variables.
 */
export function interpolateServerURL(server: OpenAPIV3.ServerObject) {
    const parts = parseServerURL(server?.url ?? '');

    return parts
        .map((part) => {
            if (part.kind === 'text') {
                return part.text;
            }
            return server.variables?.[part.name]?.default ?? `{${part.name}}`;
        })
        .join('');
}

function parseServerURL(url: string) {
    const parts = url.split(/{([^}]+)}/g);
    const result: Array<{ kind: 'variable'; name: string } | { kind: 'text'; text: string }> = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) {
            continue;
        }
        if (i % 2 === 0) {
            result.push({ kind: 'text', text: part });
        } else {
            result.push({ kind: 'variable', name: part });
        }
    }
    return result;
}
