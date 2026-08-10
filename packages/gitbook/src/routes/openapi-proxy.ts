import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

import { GITBOOK_URL } from '@/lib/env/globals';
import { matchesGitBookHost } from '@/lib/env/urls';
import { getLogger } from '@/lib/logger';
import { isAllowedByOrigins, verifyProxyRequest } from '@/lib/openapi/proxy-token';

import { type NextRequest, NextResponse } from 'next/server';

const MAX_REDIRECTS = 10;
const FETCH_TIMEOUT_MS = 30_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/** Headers that should not be forwarded from the incoming request to the target */
const REQUEST_HEADERS_TO_STRIP = new Set([
    'host',
    'origin',
    'referer',
    'connection',
    'cookie',
    'x-scalar-cookie',
    'x-scalar-user-agent',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-port',
    'x-middleware-invoke',
    'x-middleware-next',
    'x-nextjs-data',
]);

/** Response headers that should not be forwarded back to the client */
const RESPONSE_HEADERS_TO_STRIP = new Set([
    'content-encoding',
    'content-length',
    'transfer-encoding',
    'connection',
    'keep-alive',
    'set-cookie',
]);

const CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*',
    'access-control-allow-headers': '*',
    'access-control-expose-headers': '*',
} as const;

// Neutralize active HTML: a navigated proxy response must never execute script, on any origin.
// Scalar's fetch-based "Test it" is unaffected (the sandbox applies to documents, not fetch).
const PROXY_SECURITY_HEADERS = {
    'content-security-policy': 'sandbox',
    'x-content-type-options': 'nosniff',
} as const;

const PROXY_RESPONSE_HEADERS = { ...CORS_HEADERS, ...PROXY_SECURITY_HEADERS } as const;

function proxyJsonError(error: string, status: number): Response {
    return NextResponse.json({ error }, { status, headers: PROXY_SECURITY_HEADERS });
}

// The proxy must only be served on GitBook's own origin, never a customer domain, so a proxied
// response can't render under a customer's trusted origin.
function isServedOnGitBookOrigin(request: NextRequest): boolean {
    if (!GITBOOK_URL) {
        return true;
    }
    const host = (request.headers.get('x-forwarded-host') ?? request.headers.get('host'))
        ?.split(',')[0]
        ?.trim();
    if (!host) {
        return true;
    }
    return matchesGitBookHost(host);
}

/**
 * Check if an IPv4 address is in a private/reserved range.
 */
function isPrivateIPv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === undefined || b === undefined) return false;
    return (
        a === 0 || // 0.0.0.0/8
        a === 10 || // 10.0.0.0/8
        a === 127 || // 127.0.0.0/8
        (a === 169 && b === 254) || // 169.254.0.0/16
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10
        a >= 224 // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved + 255.255.255.255 broadcast
    );
}

/**
 * Check if an IPv6 address is in a private/reserved range.
 * Also handles IPv4-mapped IPv6 addresses (::ffff:x.x.x.x).
 */
function isPrivateIPv6(ip: string): boolean {
    const lower = ip.toLowerCase();

    // IPv4-mapped IPv6 (::ffff:127.0.0.1) — extract and check the IPv4 part
    const v4MappedMatch = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (v4MappedMatch?.[1]) {
        return isPrivateIPv4(v4MappedMatch[1]);
    }

    return (
        lower === '::1' ||
        lower === '::' ||
        lower.startsWith('fe80:') || // Link-local
        lower.startsWith('fc') || // Unique local (fc00::/7)
        lower.startsWith('fd') // Unique local (fc00::/7)
    );
}

/**
 * Check if an IP address (v4 or v6) is in a private/reserved range.
 */
function isPrivateIP(ip: string): boolean {
    const version = isIP(ip);
    if (version === 4) return isPrivateIPv4(ip);
    if (version === 6) return isPrivateIPv6(ip);
    return false;
}

/**
 * Check if a hostname resolves to a private/reserved IP address (SSRF protection).
 * Blocks private IPs, link-local, loopback, and cloud metadata addresses.
 */
export async function isBlockedHost(hostname: string): Promise<boolean> {
    // Strip brackets from IPv6 literals
    const host =
        hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;

    // Direct IP check
    if (isIP(host)) {
        return isPrivateIP(host);
    }

    // Resolve hostname and check all resolved IPs
    try {
        const results = await lookup(host, { all: true });
        if (results.length === 0) return true;
        return results.some((result) => isPrivateIP(result.address));
    } catch {
        // DNS resolution failed — block to be safe
        return true;
    }
}

export async function handleOpenAPIProxyRequest(request: NextRequest): Promise<Response> {
    if (!isServedOnGitBookOrigin(request)) {
        return proxyJsonError('Not found', 404);
    }

    const targetUrl = request.nextUrl.searchParams.get('scalar_url');

    if (!targetUrl) {
        return proxyJsonError('Missing required query parameter: scalar_url', 400);
    }

    // Host allowlist: verify the signed token and check the target URL is allowed.
    // This prevents the proxy from being used as an open proxy for arbitrary URLs.
    const verification = verifyProxyRequest(request.nextUrl.searchParams, targetUrl);
    if (!verification.allowed) {
        return proxyJsonError(verification.reason, 403);
    }
    const { allowedOrigins, siteId } = verification;

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(targetUrl);
    } catch {
        return proxyJsonError('Invalid URL provided in scalar_url parameter', 400);
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        return proxyJsonError('Only HTTP and HTTPS URLs are supported', 400);
    }

    // SSRF protection: block requests to private/internal addresses.
    // Note: DNS is resolved here then again inside fetch(), so a DNS rebinding attack
    // (returning a public IP first, then a private IP) could theoretically bypass this.
    // Mitigating this fully would require controlling DNS at the socket level.
    if (await isBlockedHost(parsedUrl.hostname)) {
        return proxyJsonError('Forbidden: access to private addresses is not allowed', 403);
    }

    // siteId is signed into the token, so it attributes the request to its issuing site even
    // though the open-origin route has no live site context to verify it against.
    const logger = getLogger().subLogger('openapi-proxy', { labels: { siteId } });
    logger.info(`proxying to ${parsedUrl.host}`);

    // Build forwarded headers
    const forwardedHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
        if (!REQUEST_HEADERS_TO_STRIP.has(key.toLowerCase())) {
            forwardedHeaders.set(key, value);
        }
    }

    // Scalar sends cookies via X-Scalar-Cookie when using a proxy
    const scalarCookie = request.headers.get('x-scalar-cookie');
    if (scalarCookie) {
        forwardedHeaders.set('cookie', scalarCookie);
    }

    // Scalar sends user-agent via X-Scalar-User-Agent in some environments
    const scalarUserAgent = request.headers.get('x-scalar-user-agent');
    if (scalarUserAgent) {
        forwardedHeaders.set('user-agent', scalarUserAgent);
    }

    forwardedHeaders.set('host', parsedUrl.host);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const response = await fetchWithRedirectValidation(
            targetUrl,
            {
                method: request.method,
                headers: forwardedHeaders,
                body: request.body,
                signal: controller.signal,
                // @ts-ignore - duplex is required for streaming request bodies
                duplex: 'half',
            },
            allowedOrigins
        );

        // Build response headers, stripping transport headers and upstream CORS headers
        const responseHeaders = new Headers();
        for (const [key, value] of response.headers.entries()) {
            const lower = key.toLowerCase();
            if (!RESPONSE_HEADERS_TO_STRIP.has(lower) && !lower.startsWith('access-control-')) {
                responseHeaders.set(key, value);
            }
        }

        // Add our own CORS + security headers (the latter override any upstream values)
        for (const [key, value] of Object.entries(PROXY_RESPONSE_HEADERS)) {
            responseHeaders.set(key, value);
        }

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        logger.error('upstream fetch failed:', error);
        return proxyJsonError('Failed to fetch from target URL', 502);
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Fetch with manual redirect handling to validate each redirect target
 * against SSRF protection (prevents redirect-based SSRF attacks).
 */
async function fetchWithRedirectValidation(
    url: string,
    options: RequestInit & { duplex?: string },
    allowedOrigins: string[],
    remaining = MAX_REDIRECTS
): Promise<Response> {
    const response = await fetch(url, { ...options, redirect: 'manual' });

    if (!REDIRECT_STATUSES.has(response.status) || remaining <= 0) {
        return response;
    }

    const location = response.headers.get('location');
    if (!location) {
        return response;
    }

    const redirectUrl = new URL(location, url);

    if (redirectUrl.protocol !== 'https:' && redirectUrl.protocol !== 'http:') {
        throw new Error('Redirect to non-HTTP protocol is not allowed');
    }

    if (await isBlockedHost(redirectUrl.hostname)) {
        throw new Error('Redirect to private address is not allowed');
    }

    // Check redirect target is within the allowed hosts (host + path prefix)
    if (!isAllowedByOrigins(redirectUrl.toString(), allowedOrigins)) {
        throw new Error('Redirect to a non-allowed host is not allowed');
    }

    // 307/308 preserve method and body; others convert to GET
    const preserveMethod = response.status === 307 || response.status === 308;
    const redirectHeaders = new Headers(options.headers);
    redirectHeaders.set('host', redirectUrl.host);

    let redirectOptions: RequestInit & { duplex?: string };
    if (preserveMethod) {
        if (options.body instanceof ReadableStream) {
            throw new Error('Cannot follow 307/308 redirect with a streaming request body');
        }
        redirectOptions = { ...options, headers: redirectHeaders };
    } else {
        redirectOptions = { ...options, method: 'GET', body: undefined, headers: redirectHeaders };
    }

    return fetchWithRedirectValidation(
        redirectUrl.toString(),
        redirectOptions,
        allowedOrigins,
        remaining - 1
    );
}

export function handleOpenAPIProxyOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            ...PROXY_RESPONSE_HEADERS,
            'access-control-max-age': '86400',
        },
    });
}
