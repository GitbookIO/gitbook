import { afterEach, describe, expect, it, spyOn } from 'bun:test';

import { createSearchPassStore } from './search-pass-store';
import type { DirectSearchProps } from '@/lib/search-results';

const endpoint = 'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/search';
const directSearch: DirectSearchProps = {
    apiURL: 'https://api.gitbook.com',
    organizationId: 'org_1',
    siteId: 'site_1',
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
});
