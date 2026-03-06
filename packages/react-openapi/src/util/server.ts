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

    const url = parts
        .map((part) => {
            if (part.kind === 'text') {
                return part.text;
            }
            return server.variables?.[part.name]?.default ?? `{${part.name}}`;
        })
        .join('');

    // Remove trailing slash to avoid double slashes when concatenated with paths
    return url.endsWith('/') ? url.slice(0, -1) : url;
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

/**
 * Check if any server has a host that can be used in an HTTP request.
 * This is used to determine if the "Try it" button should be shown.
 */
export function hasValidServerHost(servers: OpenAPIV3.ServerObject[]): boolean {
    if (servers.length === 0) {
        return false;
    }

    return servers.some((server) => {
        const url = interpolateServerURL(server);
        return isValidServerHost(url);
    });
}

/**
 * Get the unique hostnames from a list of servers (using default variable values).
 * Used to build the allowlist for the OpenAPI proxy.
 */
export function getAllServerHosts(servers: OpenAPIV3.ServerObject[]): string[] {
    const hosts = new Set<string>();

    for (const server of servers) {
        const url = interpolateServerURL(server);
        const hostname = extractHostname(url);
        if (hostname) {
            hosts.add(hostname);
        }
    }

    return Array.from(hosts);
}

/**
 * Extract the hostname from a URL string, handling both full URLs and bare hostnames.
 */
function extractHostname(url: string): string | null {
    try {
        return new URL(url).hostname;
    } catch {
        // Bare hostname (no protocol) — validate it looks like a domain
        if (isValidServerHost(url)) {
            return url;
        }
        return null;
    }
}

/**
 * Check if the server host/URL is valid for making direct HTTP requests.
 * Accepts both full URLs (with protocol) and hostnames (without protocol).
 */
export function isValidServerHost(url: string): boolean {
    // Check if URL starts with http:// or https://
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return true;
    }

    return /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(url);
}
