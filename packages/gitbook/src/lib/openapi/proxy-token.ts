import { createHmac, timingSafeEqual } from 'node:crypto';

import { GITBOOK_SECRET } from '@/lib/env/globals';

// Sign the allowed origins plus the issuing site id (for attribution). Null if no signing key.
function signProxyToken(siteId: string, origins: string[]): string | null {
    if (!GITBOOK_SECRET) {
        return null;
    }
    const payload = [`site:${siteId}`, ...[...origins].sort()].join('\n');
    return createHmac('sha256', GITBOOK_SECRET).update(payload).digest('hex');
}

function verifySignature(siteId: string, origins: string[], signature: string): boolean {
    const expected = signProxyToken(siteId, origins);
    if (!expected || expected.length !== signature.length) {
        return false;
    }
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Build a signed proxy URL that restricts which origins can be proxied.
 * Returns null if no signing key is configured (proxy should be disabled).
 */
export function buildSignedProxyUrl(
    baseProxyUrl: string,
    allowedOrigins: string[],
    siteId: string
): string | null {
    const origins = deduplicateAndSort(allowedOrigins);
    // A proxied request must be attributable to a site, so never issue a token without one.
    if (origins.length === 0 || !siteId) {
        return null;
    }

    const signature = signProxyToken(siteId, origins);
    if (!signature) {
        return null;
    }

    const url = new URL(baseProxyUrl);
    for (const origin of origins) {
        url.searchParams.append('allowed_origin', origin);
    }
    url.searchParams.set('site_id', siteId);
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
):
    | { allowed: true; allowedOrigins: string[]; siteId: string }
    | { allowed: false; reason: string } {
    if (!GITBOOK_SECRET) {
        return { allowed: false, reason: 'Proxy is disabled: no signing key configured' };
    }

    const allowedOrigins = searchParams.getAll('allowed_origin');
    const token = searchParams.get('token');
    // Signed into the token (so it can't be forged) and required — every proxied request must be
    // attributable to its issuing site.
    const siteId = searchParams.get('site_id');

    if (allowedOrigins.length === 0 || !token || !siteId) {
        return { allowed: false, reason: 'Missing proxy authorization token' };
    }

    const sorted = deduplicateAndSort(allowedOrigins);
    if (!verifySignature(siteId, sorted, token)) {
        return { allowed: false, reason: 'Invalid proxy authorization token' };
    }

    // Check that the target URL's host+path matches one of the allowed entries
    if (!isAllowedByOrigins(targetUrl, sorted)) {
        return {
            allowed: false,
            reason: 'Target URL is not in the allowed origins',
        };
    }

    return { allowed: true, allowedOrigins: sorted, siteId };
}

// Match by canonical host (+ port) and path boundary, never a raw prefix — else
// `api.example.com.evil.com` would pass for `api.example.com`, or `/v10` for `/v1`.
export function isAllowedByOrigins(url: string, allowedOrigins: string[]): boolean {
    let target: URL;
    try {
        target = new URL(url);
    } catch {
        return false;
    }
    return allowedOrigins.some((allowed) => matchesAllowedOrigin(target, allowed));
}

// `allowed` is a scheme-less host with an optional path, e.g. `api.example.com` or `api.example.com/v1`.
function matchesAllowedOrigin(target: URL, allowed: string): boolean {
    let allowedUrl: URL;
    try {
        allowedUrl = new URL(`https://${allowed}`);
    } catch {
        return false;
    }

    // URL.host is lowercased, punycode-normalized and includes a non-default port.
    if (target.host !== allowedUrl.host) {
        return false;
    }

    const allowedPath = stripTrailingSlash(allowedUrl.pathname);
    if (allowedPath === '') {
        return true;
    }

    const targetPath = stripTrailingSlash(target.pathname);
    return targetPath === allowedPath || targetPath.startsWith(`${allowedPath}/`);
}

function stripTrailingSlash(path: string): string {
    return path.replace(/\/+$/, '');
}

function deduplicateAndSort(values: string[]): string[] {
    return [...new Set(values)].sort();
}
