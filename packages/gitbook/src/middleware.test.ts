import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { RequestCookiesAdapter } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import * as nextHeaders from 'next/headers';
import { NextRequest } from 'next/server';

import { middleware } from './middleware';
import { getVisitorAuthBasePath } from '@/lib/data/visitor';
import { GITBOOK_API_URL } from '@/lib/env';
import { MiddlewareHeaders } from '@/lib/middleware';
import { removeTrailingSlash } from '@/lib/paths';
import {
    getVisitorAuthCookieName,
    getVisitorAuthCookieValue,
    getVisitorToken,
} from '@/lib/visitors';

const PATH = '/~gitbook/search-direct/orgs/org_1/sites/site-1';
const PASS_HEADER = 'x-gitbook-search-pass';
const SEARCH_PASS =
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwidHlwIjoic2l0ZS1zZWFyY2gtcGFzcytqd3QifQ..AAAAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAAAA';

let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, 'fetch'>>;

beforeEach(() => {
    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(null));
});

afterEach(() => fetchSpy.mockRestore());

describe('direct site search middleware', () => {
    it.each([
        ['https://hosted.gitbook.io', '', ''],
        ['https://proxy.gitbook.site', '/sites/site-1', '/'],
    ])('forwards a search from %s%s%s directly to GBX', async (host, prefix, suffix) => {
        fetchSpy.mockResolvedValueOnce(
            Response.json(
                { items: [] },
                {
                    status: 429,
                    headers: {
                        'cache-control': 'public, max-age=600',
                        'set-cookie': 'upstream=1',
                        'retry-after': '3',
                        'x-ratelimit-scope': 'site',
                        'x-ratelimit-reset': '123',
                    },
                }
            )
        );
        const body = '{"query":"tokens"}';
        const request = new NextRequest('https://origin.example.com/ignored?ignored=1', {
            method: 'POST',
            body: new TextEncoder().encode(body),
            headers: {
                'x-gitbook-url': `${host}${prefix}${PATH}${suffix}?also-ignored=1`,
                'x-gitbook-url-signature': 'internal',
                'x-gitbook-ip': '192.0.2.1',
                'cf-connecting-ip': '192.0.2.2',
                'x-forwarded-for': '192.0.2.3',
                'content-type': 'text/plain',
                'user-agent': 'Mozilla/5.0',
                [PASS_HEADER]: SEARCH_PASS,
                'x-gitbook-search-fallback': 'network',
                cookie: 'session=1',
                authorization: 'Bearer incoming-token',
            },
        });
        const response = await middleware(request);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const [url, init] = fetchSpy.mock.calls[0] ?? [];
        expect(String(url)).toBe(
            `${removeTrailingSlash(GITBOOK_API_URL)}/v1/orgs/org_1/sites/site-1/search`
        );
        expect(init).toMatchObject({ method: 'POST', redirect: 'manual', duplex: 'half' });
        expect(init?.body).toBe(request.body);
        expect(await new Response(init?.body).text()).toBe(body);
        expect(Object.fromEntries(new Headers(init?.headers))).toEqual({
            authorization: `Bearer ${SEARCH_PASS}`,
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0',
            'x-forwarded-for': '192.0.2.1',
        });
        expect(response.status).toBe(429);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(response.headers.get('x-content-type-options')).toBe('nosniff');
        expect(response.headers.get('server-timing')).toMatch(/^api;dur=\d+$/);
        expect(response.headers.get('set-cookie')).toBeNull();
        expect(response.headers.get('retry-after')).toBe('3');
        expect(response.headers.get('x-ratelimit-scope')).toBe('site');
        expect(response.headers.get('x-ratelimit-reset')).toBe('123');
        expect(await response.text()).toBe('{"items":[]}');
    });

    it.each([
        ['wrong method', 'GET', PATH, '', 405],
        ['missing pass', 'POST', PATH, '', 401],
        ['personal token', 'POST', PATH, 'personal-api-token', 401],
        ['signed API token', 'POST', PATH, 'eyJhbGciOiJIUzI1NiJ9.e30.c2ln', 401],
        ['invalid organization ID', 'POST', PATH.replace('org_1', 'org%20bad'), SEARCH_PASS, 400],
        ['invalid site ID', 'POST', PATH.replace('site-1', 'site.bad'), SEARCH_PASS, 400],
    ] as const)('rejects %s', async (_name, method, path, pass, status) => {
        const headers = new Headers({ 'x-forwarded-host': 'docs.example.com' });
        if (pass) {
            headers.set(PASS_HEADER, pass);
        }
        const response = await middleware(
            new NextRequest(`https://origin.example.com${path}`, { method, headers })
        );

        expect(response.status).toBe(status);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns an uncached 502 when the upstream request fails', async () => {
        fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));
        const response = await middleware(
            new NextRequest(`https://origin.example.com${PATH}`, {
                method: 'POST',
                headers: { 'x-forwarded-host': 'docs.example.com', [PASS_HEADER]: SEARCH_PASS },
            })
        );

        expect(response.status).toBe(502);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(response.headers.get('x-content-type-options')).toBe('nosniff');
        expect(response.headers.get('server-timing')).toMatch(/^api;dur=\d+$/);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('returns an uncached 502 when reading the upstream response body fails', async () => {
        const body = new ReadableStream({
            start(controller) {
                controller.error(new TypeError('Connection reset'));
            },
        });
        fetchSpy.mockResolvedValueOnce(new Response(body, { status: 200 }));
        const response = await middleware(
            new NextRequest(`https://origin.example.com${PATH}`, {
                method: 'POST',
                headers: { 'x-forwarded-host': 'docs.example.com', [PASS_HEADER]: SEARCH_PASS },
            })
        );

        expect(response.status).toBe(502);
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(response.headers.get('x-content-type-options')).toBe('nosniff');
        expect(response.headers.get('server-timing')).toMatch(/^api;dur=\d+$/);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('passes through null-body statuses without throwing', async () => {
        fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }));
        const response = await middleware(
            new NextRequest(`https://origin.example.com${PATH}`, {
                method: 'POST',
                headers: { 'x-forwarded-host': 'docs.example.com', [PASS_HEADER]: SEARCH_PASS },
            })
        );

        expect(response.status).toBe(204);
        expect(response.body).toBeNull();
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(response.headers.get('x-content-type-options')).toBe('nosniff');
        expect(response.headers.get('server-timing')).toMatch(/^api;dur=\d+$/);
    });
});

describe('Updates page middleware', () => {
    it.each([
        ['/changelog', '', '/changelog', null],
        ['/changelog', '?page=2', '/changelog/2', null],
        ['/changelog', '?page=500&tag=fixes&tag=releases', '/changelog/500', 'noindex, follow'],
        ['/changelog', '?tag=fixes', '/changelog', 'noindex, follow'],
        ['/changelog', '?page=1', '/changelog', null],
        ['/changelog', '?page=0', '/changelog', null],
        ['/changelog', '?page=-1', '/changelog', null],
        ['/changelog', '?page=abc', '/changelog', null],
        ['/changelog', '?page=501', '/changelog', null],
        ['/changelog.md', '?page=2', '/~gitbook/markdown/changelog', null],
        ['/changelog/rss.xml', '?page=2', '/~gitbook/rss/changelog', null],
        ['/llms-full.txt', '?page=2', '/llms-full.txt', null],
        ['/sitemap.xml', '?page=2', '/sitemap.xml', null],
        ['/changelog', '?page=2&tag=fixes&ask=test', '/changelog/2', 'none'],
        ['/~gitbook/embed/page/changelog', '?page=2', '/~gitbook/embed/page/%2Fchangelog/2', null],
    ] as const)(
        'rewrites %s%s without changing its query',
        async (path, search, suffix, robots) => {
            const url = new URL(`https://docs.example.com${path}${search}`);
            fetchSpy.mockResolvedValueOnce(
                Response.json({
                    site: 'site',
                    siteSpace: 'variant',
                    space: 'space',
                    organization: 'org',
                    apiToken: 'content-token',
                    pathname: path,
                    basePath: '',
                    siteBasePath: '',
                    canonicalUrl: url.origin + url.pathname,
                    complete: true,
                })
            );

            const request = new NextRequest(url, { headers: { 'x-forwarded-host': url.host } });
            const cookiesSpy = spyOn(nextHeaders, 'cookies').mockResolvedValue(
                RequestCookiesAdapter.seal(request.cookies)
            );
            let response;
            try {
                response = await middleware(request);
            } finally {
                cookiesSpy.mockRestore();
            }

            expect(response.headers.get('x-gitbook-route-type')).toBe('static');
            expect(response.headers.get('x-robots-tag')).toBe(robots);
            const rewrite = response.headers.get('x-middleware-rewrite');
            expect(rewrite).not.toBeNull();
            const destination = new URL(rewrite!);
            expect(destination.pathname).toEndWith(suffix);
            expect(destination.search).toBe(search);
        }
    );
});

describe('Site OAuth consent middleware', () => {
    it('should forward a request URL that finds the visitor cookie on a proxied site', async () => {
        const consentPath = '/~gitbook/oauth2/v1/site_1/authorize';
        const proxyURL = new URL(`https://proxy.gitbook.site/sites/site_1${consentPath}`);
        const siteBasePath = '/dna/docs/';
        fetchSpy.mockResolvedValueOnce(
            Response.json({
                site: 'site_1',
                siteSpace: 'variant',
                space: 'space',
                organization: 'org',
                apiToken: 'content-token',
                pathname: consentPath.slice(1),
                basePath: siteBasePath,
                siteBasePath,
                canonicalUrl: `https://docs.example.com/dna/docs${consentPath}`,
                complete: true,
            })
        );

        // The cookie is scoped the way the middleware stores the token from a proxied login callback.
        const cookieBasePath = getVisitorAuthBasePath(proxyURL, { siteBasePath });
        const cookieName = getVisitorAuthCookieName(cookieBasePath);
        const cookieValue = getVisitorAuthCookieValue(cookieBasePath, 'visitor-jwt');
        const request = new NextRequest(`https://origin.example.com/ignored?gb_oauth_state=abc`, {
            headers: {
                'x-gitbook-url': `${proxyURL}?gb_oauth_state=abc`,
                'x-gitbook-url-signature': 'internal',
                cookie: `${cookieName}=${encodeURIComponent(cookieValue)}`,
            },
        });
        const cookiesSpy = spyOn(nextHeaders, 'cookies').mockResolvedValue(
            RequestCookiesAdapter.seal(request.cookies)
        );
        let response;
        try {
            response = await middleware(request);
        } finally {
            cookiesSpy.mockRestore();
        }

        expect(response.headers.get('x-middleware-rewrite')).not.toBeNull();
        const forwardedURL = response.headers.get(
            `x-middleware-request-${MiddlewareHeaders.SiteRequestURL}`
        );
        expect(forwardedURL).toBe(proxyURL.toString());
        expect(
            getVisitorToken({
                cookies: request.cookies.getAll(),
                headers: new Headers(),
                url: new URL(forwardedURL!),
            })
        ).toMatchObject({ source: 'visitor-auth-cookie', token: 'visitor-jwt' });
    });
});
