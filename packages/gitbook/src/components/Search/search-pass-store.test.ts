import { afterEach, describe, expect, it, spyOn } from 'bun:test';

import { createSearchPassStore } from './search-pass-store';
import type { DirectSearchProps } from '@/lib/search-results';

const endpoint = '/docs/~gitbook/search-direct/orgs/org_1/sites/site_1';
const directSearch: DirectSearchProps = {
    searchURL: endpoint,
    linker: {
        urlMode: 'url-host',
        siteHost: 'docs.example.com',
        siteBasePath: '/docs/',
        spaceBasePath: '/docs/api/',
        gitbookURL: undefined,
    },
    spaces: {},
    passURL: '/docs/~gitbook/search-pass',
};

/** Answer each pass request with a new pass, and each API search with the next status. */
function mockFetch(apiStatuses: number[], passLifetimesMs: number[] = []) {
    const searchPasses: (string | null)[] = [];
    let passes = 0;
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
        input: RequestInfo | URL,
        init?: RequestInit
    ) => {
        if (init?.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        if (String(input) === directSearch.passURL) {
            passes += 1;
            return Response.json({
                token: `pass-${passes}`,
                expiresIn: passLifetimesMs.shift() ?? 300_000,
            });
        }

        expect(String(input)).toBe(endpoint);
        searchPasses.push(new Headers(init?.headers).get('x-gitbook-search-pass'));
        const status = apiStatuses.shift() ?? 200;
        return status === 200 ? Response.json({ items: [] }) : new Response(null, { status });
    }) as typeof fetch);

    return { searchPasses, fetchSpy };
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

    it('posts the search pass and query to the same-origin site endpoint', async () => {
        const fetchSpy = spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(Response.json({ token: 'pass-1', expiresIn: 300_000 }))
            .mockResolvedValueOnce(Response.json({ items: [] }));
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        const scope = { mode: 'all' } as const;
        expect(
            await store.search({
                query: 'tokens',
                searchId: 'search-1',
                scope,
                signal: new AbortController().signal,
                asEmbeddable: false,
            })
        ).toEqual({ type: 'results', results: [] });
        const [url, init] = fetchSpy.mock.calls[1] ?? [];
        expect(url).toBe(endpoint);
        expect(init).toMatchObject({
            method: 'POST',
            credentials: 'omit',
            mode: 'same-origin',
            body: JSON.stringify({ query: 'tokens', searchId: 'search-1', ...scope }),
        });
        const headers = new Headers(init?.headers);
        expect(headers.get('content-type')).toBe('application/json');
        expect(headers.get('x-gitbook-search-pass')).toBe('pass-1');
        expect(headers.has('authorization')).toBe(false);
    });

    it('stays on the route for the rest of the page after a 403', async () => {
        const { searchPasses, fetchSpy } = mockFetch([403]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        expect(await search(store)).toEqual({ type: 'route', reason: '403' });
        await store.requestPass();
        expect(await search(store)).toEqual({ type: 'route', reason: '403' });
        expect(searchPasses).toHaveLength(1);
    });

    it.each([
        ['an expired pass', [], [1_000], 'expired', ['pass-2']],
        ['a 401', [401], [], '401', ['pass-1', 'pass-2']],
    ])(
        'sends the search to the route on %s and searches directly again with a new pass',
        async (_name, apiStatuses, passLifetimesMs, reason, sent) => {
            const { searchPasses, fetchSpy } = mockFetch(apiStatuses, passLifetimesMs);
            restore = () => fetchSpy.mockRestore();
            const store = createSearchPassStore(directSearch);
            await store.requestPass();

            expect(await search(store)).toEqual({ type: 'route', reason });
            await new Promise((resolve) => setTimeout(resolve, 0));
            expect(await search(store)).toEqual({ type: 'results', results: [] });
            expect(searchPasses).toEqual(sent);

            const refresh = store.requestPass();
            expect(await search(store)).toEqual({ type: 'route', reason: undefined });
            await refresh;
            expect(searchPasses).toEqual(sent);
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
            if (String(input) === directSearch.passURL) {
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
        const { searchPasses, fetchSpy } = mockFetch([]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore(directSearch);
        await store.requestPass();

        const controller = new AbortController();
        controller.abort();
        await expect(search(store, controller.signal)).rejects.toThrow();
        expect(await search(store)).toEqual({ type: 'results', results: [] });
        expect(searchPasses).toHaveLength(1);
    });

    it('falls back for an unknown space without latching later searches to the route', async () => {
        let searchCalls = 0;
        const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
            input: RequestInfo | URL
        ) => {
            if (String(input) === directSearch.passURL) {
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
