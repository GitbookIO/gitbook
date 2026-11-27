import { afterEach, describe, expect, it, spyOn } from 'bun:test';

import { SEARCH_FALLBACK_HEADER, createSearchPassStore } from './search-pass-store';
import type { DirectSearchProps } from '@/lib/search-results';

const endpoint = 'https://api.gitbook.com/cache/v1/orgs/org_1/sites/site_1/search';
const proxyURL = '/~gitbook/search-direct/orgs/org_1/sites/site_1';
const directSearch: DirectSearchProps = {
    apiURL: 'https://api.gitbook.com/cache/',
    organizationId: 'org_1',
    siteId: 'site_1',
    proxyURL,
    linker: {
        urlMode: 'url-host',
        siteHost: 'docs.example.com',
        siteBasePath: '/',
        spaceBasePath: '/',
        gitbookURL: undefined,
    },
    spaces: {},
    passURL: '/~gitbook/search-pass',
};

/** Answer each pass request with a new pass, and each API search with the next status. */
function mockFetch(apiStatuses: number[], passLifetimesMs: number[] = []) {
    const authorizations: (string | null)[] = [];
    let passes = 0;
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
        input: RequestInfo | URL,
        init?: RequestInit
    ) => {
        if (init?.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        if (String(input) === '/~gitbook/search-pass') {
            passes += 1;
            return Response.json({
                token: `pass-${passes}`,
                expiresIn: passLifetimesMs.shift() ?? 300_000,
            });
        }

        expect(String(input)).toBe(endpoint);
        authorizations.push(new Headers(init?.headers).get('authorization'));
        const status = apiStatuses.shift() ?? 200;
        return status === 200 ? Response.json({ items: [] }) : new Response(null, { status });
    }) as typeof fetch);

    return { authorizations, fetchSpy };
}

function search(store: ReturnType<typeof createSearchPassStore>, signal?: AbortSignal) {
    return store.search({
        query: 'tokens',
        scope: { mode: 'all' },
        signal: signal ?? new AbortController().signal,
        asEmbeddable: false,
    });
}

describe('createSearchPassStore', () => {
    let restore: (() => void) | undefined;
    afterEach(() => restore?.());

    it('switches to the site proxy after an API network failure', async () => {
        const fetchSpy = spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(Response.json({ token: 'pass-1', expiresIn: 300_000 }))
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockImplementation(async () => Response.json({ items: [] }));
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
            directSearch.passURL,
            endpoint,
            proxyURL,
            proxyURL,
        ]);
        const init = fetchSpy.mock.calls[2]?.[1];
        expect(init).toMatchObject({ mode: 'same-origin', credentials: 'same-origin' });
        expect(init?.body).toBe(JSON.stringify({ query: 'tokens', mode: 'all' }));
        const headers = new Headers(init?.headers);
        expect(headers.get('x-gitbook-search-pass')).toBe('pass-1');
        expect(headers.get(SEARCH_FALLBACK_HEADER)).toBe('network');
        expect(headers.has('authorization')).toBe(false);
        expect(new Headers(fetchSpy.mock.calls[3]?.[1]?.headers).has(SEARCH_FALLBACK_HEADER)).toBe(
            false
        );
    });

    it('switches to the site proxy after an API timeout', async () => {
        const originalSetTimeout = globalThis.setTimeout;
        const timeoutSpy = spyOn(globalThis, 'setTimeout').mockImplementation(((
            fn: (...args: unknown[]) => void,
            ms?: number,
            ...args: unknown[]
        ) => {
            let delay = ms;
            if (ms === 5_000) {
                delay = 0;
            }
            return originalSetTimeout(fn, delay, ...args);
        }) as typeof setTimeout);
        const fetchSpy = spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(Response.json({ token: 'pass-1', expiresIn: 300_000 }))
            .mockImplementationOnce(
                (_url, init) =>
                    new Promise((_, reject) => {
                        init?.signal?.addEventListener(
                            'abort',
                            () => reject(new DOMException('Aborted', 'AbortError')),
                            { once: true }
                        );
                    })
            )
            .mockResolvedValueOnce(Response.json({ items: [] }));
        restore = () => {
            timeoutSpy.mockRestore();
            fetchSpy.mockRestore();
        };
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
            directSearch.passURL,
            endpoint,
            proxyURL,
        ]);
        expect(new Headers(fetchSpy.mock.calls[2]?.[1]?.headers).get(SEARCH_FALLBACK_HEADER)).toBe(
            'timeout'
        );
    });

    it('refreshes the pass on a 401 from the site proxy', async () => {
        const fetchSpy = spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(Response.json({ token: 'pass-1', expiresIn: 300_000 }))
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce(new Response(null, { status: 401 }))
            .mockResolvedValueOnce(Response.json({ token: 'pass-2', expiresIn: 300_000 }))
            .mockResolvedValueOnce(Response.json({ items: [] }));
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'route', reason: '401' });
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
            directSearch.passURL,
            endpoint,
            proxyURL,
            directSearch.passURL,
            proxyURL,
        ]);
        expect(new Headers(fetchSpy.mock.calls[4]?.[1]?.headers).get('x-gitbook-search-pass')).toBe(
            'pass-2'
        );
    });

    it('honors rate-limit headers on a 429 from the site proxy', async () => {
        const resetAtSeconds = Math.ceil((Date.now() + 30_000) / 1000);
        const fetchSpy = spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(Response.json({ token: 'pass-1', expiresIn: 300_000 }))
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce(
                new Response(null, {
                    status: 429,
                    headers: {
                        'x-ratelimit-scope': 'site',
                        'x-ratelimit-reset': String(resetAtSeconds),
                    },
                })
            );
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        await expect(search(store)).rejects.toThrow('Search is rate limited');
        await expect(search(store)).rejects.toThrow('Search is rate limited');
        expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
            directSearch.passURL,
            endpoint,
            proxyURL,
        ]);
    });

    it('uses the server route after the site proxy also fails', async () => {
        const fetchSpy = spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(Response.json({ token: 'pass-1', expiresIn: 300_000 }))
            .mockRejectedValueOnce(new TypeError('Failed to fetch'))
            .mockResolvedValueOnce(new Response(null, { status: 502 }));
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'route', reason: '502' });
        expect(await search(store)).toEqual({ type: 'route', reason: '502' });
        expect(fetchSpy.mock.calls.map(([url]) => url)).toEqual([
            directSearch.passURL,
            endpoint,
            proxyURL,
        ]);
    });

    it('stays on the route for the rest of the page after a 403', async () => {
        const { authorizations, fetchSpy } = mockFetch([403]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'route', reason: '403' });
        await store.requestPass();
        expect(await search(store)).toEqual({ type: 'route', reason: '403' });
        expect(authorizations).toHaveLength(1);
    });

    it.each([
        ['an expired pass', [], [1_000], 'expired', ['Bearer pass-2']],
        ['a 401', [401], [], '401', ['Bearer pass-1', 'Bearer pass-2']],
    ])(
        'sends the search to the route on %s and searches directly again with a new pass',
        async (_name, apiStatuses, passLifetimesMs, reason, sent) => {
            const { authorizations, fetchSpy } = mockFetch(apiStatuses, passLifetimesMs);
            restore = () => fetchSpy.mockRestore();
            const store = createSearchPassStore(directSearch);
            await store.requestPass();

            expect(await search(store)).toEqual({ type: 'route', reason });
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(await search(store)).toEqual({ type: 'results', results: [] });
            expect(authorizations).toEqual(sent);

            const refresh = store.requestPass();
            expect(await search(store)).toEqual({ type: 'route', reason: undefined });
            await refresh;
            expect(authorizations).toEqual(sent);
        }
    );

    it('keeps the one-refresh bound when a 401 arrives while a refresh is pending', async () => {
        const replies = {
            search: Promise.withResolvers<Response>(),
            pass: Promise.withResolvers<Response>(),
        };
        let passRequests = 0;
        const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
            input: RequestInfo | URL
        ) => {
            if (String(input) === '/~gitbook/search-pass') {
                passRequests += 1;
                return passRequests === 2
                    ? replies.pass.promise
                    : Response.json({ token: `pass-${passRequests}`, expiresIn: 300_000 });
            }
            return passRequests === 1
                ? replies.search.promise
                : new Response(null, { status: 401 });
        }) as typeof fetch);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        const inFlight = search(store);
        const refresh = store.requestPass();
        replies.search.resolve(new Response(null, { status: 401 }));
        expect(await inFlight).toEqual({ type: 'route', reason: '401' });
        replies.pass.resolve(Response.json({ token: 'pass-2', expiresIn: 300_000 }));
        await refresh;

        expect(await search(store)).toEqual({ type: 'route', reason: '401' });
        expect(passRequests).toBe(2);
    });

    it('neither retries nor falls back when the search is aborted', async () => {
        const { authorizations, fetchSpy } = mockFetch([]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        const controller = new AbortController();
        controller.abort();
        await expect(search(store, controller.signal)).rejects.toThrow();
        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(authorizations).toHaveLength(1);
    });

    it('falls back for an unknown space without latching later searches to the route', async () => {
        let searchCalls = 0;
        const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
            input: RequestInfo | URL
        ) => {
            if (String(input) === '/~gitbook/search-pass') {
                return Response.json({ token: 'pass-1', expiresIn: 300_000 });
            }
            searchCalls += 1;
            if (searchCalls === 1) {
                return Response.json({
                    items: [
                        {
                            type: 'space',
                            id: 'space_unknown',
                            title: 'Unknown',
                            score: 1,
                            pages: [
                                {
                                    id: 'page_1',
                                    title: 'Page 1',
                                    path: 'page-1',
                                    score: 1,
                                    rank: 1,
                                    ancestors: [],
                                    urls: { app: 'https://app.gitbook.com/o/org/s/space' },
                                },
                            ],
                        },
                    ],
                });
            }
            return Response.json({ items: [] });
        }) as typeof fetch);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'route', reason: 'unknown_space' });
        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(searchCalls).toBe(2);
    });
});
