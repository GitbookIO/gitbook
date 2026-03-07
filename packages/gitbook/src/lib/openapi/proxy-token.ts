import { createHmac, timingSafeEqual } from 'node:crypto';
import { GITBOOK_SECRET } from '@/lib/env/globals';
import { extractOrigin } from '@gitbook/react-openapi';

/**
 * Sign a list of allowed origins for the OpenAPI proxy.
 * Returns null if no signing key is available.
 */
function signOrigins(origins: string[]): string | null {
    if (!GITBOOK_SECRET) {
        return null;
    }
    const payload = origins.sort().join('\n');
    return createHmac('sha256', GITBOOK_SECRET).update(payload).digest('hex');
}

/**
 * Verify a proxy token signature against the allowed origins.
 */
function verifySignature(origins: string[], signature: string): boolean {
    const expected = signOrigins(origins);
    if (!expected || expected.length !== signature.length) {
        return false;
    }
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Build a signed proxy URL that restricts which origins can be proxied.
 * Returns null if no signing key is configured (proxy should be disabled).
 */
export function buildSignedProxyUrl(baseProxyUrl: string, allowedOrigins: string[]): string | null {
    const origins = deduplicateAndSort(allowedOrigins);
    if (origins.length === 0) {
        return null;
    }

    const signature = signOrigins(origins);
    if (!signature) {
        return null;
    }

    const url = new URL(baseProxyUrl);
    for (const origin of origins) {
        url.searchParams.append('allowed_origin', origin);
    }
    url.searchParams.set('token', signature);

    return url.toString();
}

/**
 * Verify the proxy request's signed token and check that the target URL's
 * origin is allowed by the signed origins.
 */
export function verifyProxyRequest(
    searchParams: URLSearchParams,
    targetUrl: string
): { allowed: true; allowedOrigins: string[] } | { allowed: false; reason: string } {
    if (!GITBOOK_SECRET) {
        return { allowed: false, reason: 'Proxy is disabled: no signing key configured' };
    }

    const allowedOrigins = searchParams.getAll('allowed_origin');
    const token = searchParams.get('token');

    if (allowedOrigins.length === 0 || !token) {
        return { allowed: false, reason: 'Missing proxy authorization token' };
    }

    const sorted = deduplicateAndSort(allowedOrigins);
    if (!verifySignature(sorted, token)) {
        return { allowed: false, reason: 'Invalid proxy authorization token' };
    }

    // Check that the target URL's host+path matches one of the allowed entries
    if (!isAllowedByOrigins(targetUrl, sorted)) {
        return {
            allowed: false,
            reason: 'Target URL is not in the allowed origins',
        };
    }

    return { allowed: true, allowedOrigins: sorted };
}

/**
 * Check if a URL's host+path matches one of the allowed origin entries.
 */
export function isAllowedByOrigins(url: string, allowedOrigins: string[]): boolean {
    const hostAndPath = extractOrigin(url);
    if (!hostAndPath) {
        return false;
    }
    return allowedOrigins.some((allowed) => hostAndPath.startsWith(allowed));
}

function deduplicateAndSort(values: string[]): string[] {
    return [...new Set(values)].sort();
}
