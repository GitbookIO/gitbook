import { createHmac, timingSafeEqual } from 'node:crypto';
import { GITBOOK_SECRET } from '@/lib/env/globals';

/**
 * Sign a list of allowed hosts for the OpenAPI proxy.
 * Returns null if no signing key is available.
 */
function signHosts(hosts: string[]): string | null {
    if (!GITBOOK_SECRET) {
        return null;
    }
    const payload = hosts.sort().join('\n');
    return createHmac('sha256', GITBOOK_SECRET).update(payload).digest('hex');
}

/**
 * Verify a proxy token signature against the allowed hosts.
 */
function verifySignature(hosts: string[], signature: string): boolean {
    const expected = signHosts(hosts);
    if (!expected || expected.length !== signature.length) {
        return false;
    }
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Build a signed proxy URL that restricts which hosts can be proxied.
 * Returns null if no signing key is configured (proxy should be disabled).
 */
export function buildSignedProxyUrl(baseProxyUrl: string, allowedHosts: string[]): string | null {
    const hosts = deduplicateAndSort(allowedHosts);
    if (hosts.length === 0) {
        return null;
    }

    const signature = signHosts(hosts);
    if (!signature) {
        return null;
    }

    const url = new URL(baseProxyUrl);
    for (const host of hosts) {
        url.searchParams.append('allowed_host', host);
    }
    url.searchParams.set('token', signature);

    return url.toString();
}

/**
 * Verify the proxy request's signed token and check that the target URL's
 * hostname is allowed by the signed hosts.
 */
export function verifyProxyRequest(
    searchParams: URLSearchParams,
    targetUrl: string
): { allowed: true; allowedHosts: string[] } | { allowed: false; reason: string } {
    if (!GITBOOK_SECRET) {
        return { allowed: false, reason: 'Proxy is disabled: no signing key configured' };
    }

    const allowedHosts = searchParams.getAll('allowed_host');
    const token = searchParams.get('token');

    if (allowedHosts.length === 0 || !token) {
        return { allowed: false, reason: 'Missing proxy authorization token' };
    }

    const sorted = deduplicateAndSort(allowedHosts);
    if (!verifySignature(sorted, token)) {
        return { allowed: false, reason: 'Invalid proxy authorization token' };
    }

    // Check that the target URL's hostname is in the allowed list
    let targetHostname: string;
    try {
        targetHostname = new URL(targetUrl).hostname;
    } catch {
        return { allowed: false, reason: 'Invalid target URL' };
    }

    if (!sorted.includes(targetHostname)) {
        return {
            allowed: false,
            reason: 'Target URL host is not in the allowed list',
        };
    }

    return { allowed: true, allowedHosts: sorted };
}

function deduplicateAndSort(values: string[]): string[] {
    return [...new Set(values)].sort();
}
