import { SiteVisibility } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

/**
 * CORS headers the server-card extension requires on a discovery endpoint.
 */
const CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET',
    'access-control-allow-headers': 'Content-Type, If-None-Match',
    'access-control-expose-headers': 'ETag',
};

const CACHE_CONTROL = 'public, max-age=3600';

/**
 * Serve a discovery document with the caching and CORS headers the extension asks a host for, or
 * `304` when the client's copy is still current.
 */
export async function serveDiscoveryDocument(
    context: GitBookSiteContext,
    request: Request,
    options: {
        document: unknown;
        mediaType: string;
    }
): Promise<Response> {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const body = JSON.stringify(options.document);
    const etag = `"${await hashDocument(body)}"`;

    const isPubliclyReachable =
        context.site.visibility === SiteVisibility.Public ||
        context.site.visibility === SiteVisibility.Unlisted;

    const headers = {
        ...CORS_HEADERS,
        'cache-control': isPubliclyReachable ? CACHE_CONTROL : 'no-store',
        etag,
    };

    if (matchesEtag(request.headers.get('if-none-match'), etag)) {
        return new Response(null, { status: 304, headers });
    }

    return new Response(body, {
        headers: { ...headers, 'content-type': `${options.mediaType}; charset=utf-8` },
    });
}

async function hashDocument(body: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function matchesEtag(ifNoneMatch: string | null, etag: string): boolean {
    if (!ifNoneMatch) {
        return false;
    }
    if (ifNoneMatch.trim() === '*') {
        return true;
    }
    return ifNoneMatch
        .split(',')
        .some((candidate) => candidate.trim().replace(/^W\//, '') === etag);
}
