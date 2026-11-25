import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { NextRequest } from 'next/server';

import { middleware } from './middleware';
import { GITBOOK_API_URL } from '@/lib/env';
import { removeTrailingSlash } from '@/lib/paths';

const PATH = '/~gitbook/search-direct/orgs/org_1/sites/site-1';
const PASS_HEADER = 'x-gitbook-search-pass';
const PROTECTED_HEADER = btoa(
    JSON.stringify({ alg: 'dir', enc: 'A256GCM', typ: 'site-search-pass+jwt' })
).replace(/=+$/, '');
const SEARCH_PASS = `${PROTECTED_HEADER}..AAAAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAAAA`;

let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, 'fetch'>>;

beforeEach(() => {
    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(null));
});

afterEach(() => fetchSpy.mockRestore());

describe('direct site search middleware', () => {
    it.each([
        ['https://hosted.gitbook.io', '', ''],
        ['https://docs.example.com', '/docs', ''],
        ['https://proxy.gitbook.site', '/sites/site-1', ''],
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
                [PASS_HEADER]: SEARCH_PASS,
                accept: 'application/json',
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
            accept: 'application/json',
            authorization: `Bearer ${SEARCH_PASS}`,
            'content-type': 'application/json',
            'x-forwarded-for': '192.0.2.1',
        });
        expect(response.status).toBe(429);
        expect(response.headers.get('cache-control')).toBe('no-store');
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
        expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('leaves requests without a site URL to Next.js', async () => {
        const response = await middleware(new NextRequest('https://origin.example.com/'));

        expect(response.headers.get('x-middleware-next')).toBe('1');
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
