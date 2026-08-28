/**
 * Dev-only proxy that stands in for the upstream layer resolving PPR requests.
 *
 * It resolves the incoming URL against the published-URLs API and forwards the request to the local
 * app with the complete `x-gbo-*` header set, so PPR routes can be exercised locally:
 *
 *     bun dev                       # app on :3000
 *     bun run dev:ppr               # this proxy on :3001
 *     open http://localhost:3001/url/gitbook.com/docs
 *
 * Never deploy this. It trusts its input and caches API tokens in memory.
 */
import type { PublishedSiteContent, PublishedSiteContentLookup, Space } from '@gitbook/api';

import { PPRRequestHeaders, signPPRRequestHeaders } from '../src/lib/ppr';

const PORT = Number(process.env.PPR_PROXY_PORT || 3001);
const UPSTREAM = process.env.PPR_UPSTREAM || 'http://localhost:3000';
const API_URL = process.env.GITBOOK_API_URL || 'https://api.gitbook.com/cache';
const API_TOKEN = process.env.GITBOOK_API_TOKEN;
const REVALIDATION_ID = process.env.PPR_REVALIDATION_ID;
const LOOKUP_TTL = Number(process.env.PPR_LOOKUP_TTL || 60) * 1000;

const URL_PREFIX = '/url/';
const PASSTHROUGH_PREFIXES = ['/_next/', '/~gitbook/static/'];

function log(message: string) {
    // biome-ignore lint/suspicious/noConsole: this is a CLI script
    console.log(`[ppr-proxy] ${message}`);
}

// The app rejects an unsigned header set, so `bun dev` must run with the same secret.
function requireSecret(): string {
    const secret = process.env.GITBOOK_SECRET;
    if (!secret) {
        log(
            'GITBOOK_SECRET is not set: the app rejects unsigned PPR headers. Add it to .env.local.'
        );
        process.exit(1);
    }
    return secret;
}

const SECRET = requireSecret();

const cache = new Map<string, { value: unknown; expiresAt: number }>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Cache and dedupe an API call. A single page load fans out into many requests for the same site,
 * and the site root lookup is shared by every page of a site.
 */
function cached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const entry = cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
        return Promise.resolve(entry.value as T);
    }

    const pending = inflight.get(key);
    if (pending) {
        return pending as Promise<T>;
    }

    const promise = fetcher()
        .then((value) => {
            cache.set(key, { value, expiresAt: Date.now() + LOOKUP_TTL });
            return value;
        })
        .finally(() => inflight.delete(key));

    inflight.set(key, promise);
    return promise;
}

async function api<T>(path: string, init: RequestInit, token = API_TOKEN): Promise<T> {
    const response = await fetch(`${API_URL}/v1${path}`, {
        ...init,
        headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
            ...init.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`${path}: ${response.status} ${await response.text()}`);
    }

    return response.json() as Promise<T>;
}

function lookupPublishedURL(url: string): Promise<PublishedSiteContentLookup> {
    return cached(`url:${url}`, () =>
        api<PublishedSiteContentLookup>('/urls/published', {
            method: 'POST',
            body: JSON.stringify({ url }),
        })
    );
}

/**
 * The lookup only carries a revision for preview URLs, so for a regular published URL we read the
 * space's active revision using the short-lived token the lookup returned.
 */
function getActiveRevision(content: PublishedSiteContent): Promise<string> {
    return cached(`revision:${content.space}`, async () => {
        const space = await api<Space>(`/spaces/${content.space}`, {}, content.apiToken);
        return space.revision;
    });
}

/**
 * The `x-gbo-default-*` headers describe the site's default variant, which is the cache key of the
 * shared header. Resolving the site root is the only way to get it from the published-URLs API.
 */
async function getDefaults(content: PublishedSiteContent) {
    const fallback = {
        siteSection: content.siteSection,
        siteSpace: content.siteSpace,
        space: content.space,
    };

    try {
        const rootURL = `https://${new URL(content.canonicalUrl).host}${content.siteBasePath}`;
        const root = await lookupPublishedURL(rootURL);
        if ('redirect' in root) {
            return fallback;
        }
        return { siteSection: root.siteSection, siteSpace: root.siteSpace, space: root.space };
    } catch {
        return fallback;
    }
}

async function setPPRHeaders(
    headers: Headers,
    content: PublishedSiteContent & { revision: string },
    defaults: { siteSection: string | undefined; siteSpace: string; space: string },
    secret: string
) {
    headers.set(PPRRequestHeaders.Site, content.site);
    headers.set(PPRRequestHeaders.SiteSection, content.siteSection ?? '');
    headers.set(PPRRequestHeaders.SiteSpace, content.siteSpace);
    headers.set(PPRRequestHeaders.Space, content.space);
    headers.set(PPRRequestHeaders.SiteBasePath, content.siteBasePath);
    headers.set(PPRRequestHeaders.BasePath, content.basePath);
    // An empty pathname is rejected; the root page is `/`.
    headers.set(PPRRequestHeaders.Pathname, content.pathname || '/');
    headers.set(PPRRequestHeaders.Organization, content.organization);
    headers.set(PPRRequestHeaders.ShareKey, content.shareKey ?? '');
    headers.set(PPRRequestHeaders.Complete, String(content.complete));
    headers.set(PPRRequestHeaders.ContextID, content.contextId ?? '');
    headers.set(PPRRequestHeaders.CanonicalURL, content.canonicalUrl);
    // Anything other than '', 'true' or 'false' rejects the whole PPR request.
    headers.set(
        PPRRequestHeaders.Preview,
        content.preview === undefined ? '' : String(content.preview)
    );
    headers.set(PPRRequestHeaders.Revision, content.revision);
    headers.set(PPRRequestHeaders.ChangeRequest, content.changeRequest ?? '');
    headers.set(PPRRequestHeaders.APIToken, content.apiToken);
    headers.set(PPRRequestHeaders.RevalidationID, REVALIDATION_ID || content.revision);
    // Unlike the other optional headers this one is checked with `has()`, so it must be sent even
    // when the site has no sections.
    headers.set(PPRRequestHeaders.DefaultSiteSection, defaults.siteSection ?? '');
    headers.set(PPRRequestHeaders.DefaultSiteSpace, defaults.siteSpace);
    headers.set(PPRRequestHeaders.DefaultSpace, defaults.space);
    // Signed last: the signature covers every other PPR header.
    await signPPRRequestHeaders(headers, secret);
}

/**
 * `fetch` decodes the response body, so the upstream framing headers no longer describe what we are
 * about to send. Forwarding `content-encoding: gzip` with plain bytes renders as a blank page.
 */
const DECODED_RESPONSE_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding'];

async function forward(request: Request, url: URL, headers: Headers): Promise<Response> {
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const upstreamURL = new URL(url.pathname + url.search, UPSTREAM);

    // `/url/` mode is only enabled for requests on the app's own host (`GITBOOK_URL`), so the proxy
    // host must not leak through: the app would treat it as a custom domain and 404.
    headers.set('host', upstreamURL.host);

    let response: Response;
    try {
        response = await fetch(upstreamURL, {
            method: request.method,
            headers,
            body: hasBody ? request.body : undefined,
            redirect: 'manual',
            ...(hasBody ? { duplex: 'half' } : {}),
        } as RequestInit);
    } catch (error) {
        log(`${request.method} ${url.pathname} → upstream unreachable at ${UPSTREAM}`);
        return new Response(`Upstream ${UPSTREAM} unreachable: ${error}`, { status: 502 });
    }

    const responseHeaders = new Headers(response.headers);
    for (const name of DECODED_RESPONSE_HEADERS) {
        responseHeaders.delete(name);
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    });
}

async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // `fetch` can't perform an upgrade, so hot reload only works when hitting the app directly.
    if (request.headers.get('upgrade') === 'websocket') {
        return new Response('Websocket upgrades are not proxied', { status: 501 });
    }

    const headers = new Headers(request.headers);

    // Never let a client inject its own PPR headers.
    for (const name of Object.values(PPRRequestHeaders)) {
        headers.delete(name);
    }

    if (
        !url.pathname.startsWith(URL_PREFIX) ||
        PASSTHROUGH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
    ) {
        return forward(request, url, headers);
    }

    const publishedURL = `https://${url.pathname.slice(URL_PREFIX.length)}${url.search}`;

    const skip = (reason: string) => {
        log(`${request.method} ${url.pathname} → no PPR: ${reason}`);
        return forward(request, url, headers);
    };

    let content: PublishedSiteContent;
    try {
        const result = await lookupPublishedURL(publishedURL);
        if ('redirect' in result) {
            return skip(`lookup redirected to ${result.redirect}`);
        }
        content = result;
    } catch (error) {
        return skip(`lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    let revision: string;
    let defaults: Awaited<ReturnType<typeof getDefaults>>;
    try {
        [revision, defaults] = await Promise.all([
            content.revision ?? getActiveRevision(content),
            getDefaults(content),
        ]);
    } catch (error) {
        return skip(`no revision: ${error instanceof Error ? error.message : String(error)}`);
    }

    await setPPRHeaders(headers, { ...content, revision }, defaults, SECRET);

    log(
        `${request.method} ${url.pathname} → site=${content.site} space=${content.space} revision=${revision}`
    );

    return forward(request, url, headers);
}

Bun.serve({
    port: PORT,
    idleTimeout: 60,
    fetch: handle,
});

log(`listening on http://localhost:${PORT} → ${UPSTREAM}`);
log(`try http://localhost:${PORT}/url/gitbook.com/docs`);
