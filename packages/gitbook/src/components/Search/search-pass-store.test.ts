import { afterEach, describe, expect, it, spyOn } from 'bun:test';

import { createSearchPassStore, searchWithPass } from './search-pass-store';
import type { DirectSearchProps } from '@/lib/search-results';

const endpoint = 'https://api.gitbook.com/v1/orgs/org_1/sites/site_1/search';
const target: DirectSearchProps = {
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
};

type Call = { url: string; authorization: string | null };

/** Answer the warm-up with a new pass each time, and each API search with the next status. */
function mockFetch(
    apiStatuses: number[],
    passLifetimesMs: number[] = [],
    warmUpStatuses: number[] = []
) {
    const calls: Call[] = [];
    let passes = 0;
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
        input: RequestInfo | URL,
        init?: RequestInit
    ) => {
        const url = String(input);
        const authorization = new Headers(init?.headers).get('authorization');
        calls.push({ url, authorization });
        if (init?.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        if (url === '/~gitbook/search-prewarm') {
            const warmUpStatus = warmUpStatuses.shift() ?? 200;
            if (warmUpStatus !== 200) {
                return new Response(null, { status: warmUpStatus });
            }
            passes += 1;
            return Response.json(
                {
                    token: `pass-${passes}`,
                    expiresAt: new Date(
                        Date.now() + (passLifetimesMs.shift() ?? 300_000)
                    ).toISOString(),
                    endpoint,
                },
                { headers: { date: new Date().toUTCString() } }
            );
        }

        const status = apiStatuses.shift() ?? 200;
        return status === 200 ? Response.json({ items: [] }) : new Response(null, { status });
    }) as typeof fetch);

    return { calls, fetchSpy };
}

async function search(store: ReturnType<typeof createSearchPassStore>, signal?: AbortSignal) {
    return searchWithPass({
        store,
        body: { query: 'tokens', mode: 'all' },
        signal: signal ?? new AbortController().signal,
    });
}

const apiCalls = (calls: Call[]) => calls.filter((call) => call.url === endpoint);

describe('searchWithPass', () => {
    let restore: (() => void) | undefined;
    afterEach(() => restore?.());

    it('falls back to the route once on 403 and never calls the API again for the page', async () => {
        const { calls, fetchSpy } = mockFetch([403]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore('/~gitbook/search-prewarm', target);
        await store.warmUp();

        expect(await search(store)).toBeNull();
        expect(store.takeFallbackReport()).toBe('forbidden');

        await store.warmUp();
        expect(await search(store)).toBeNull();
        expect(apiCalls(calls)).toHaveLength(1);
    });

    it('refreshes the pass once on 401 and retries once before falling back', async () => {
        const { calls, fetchSpy } = mockFetch([401, 401]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore('/~gitbook/search-prewarm', target);
        await store.warmUp();

        expect(await search(store)).toBeNull();
        expect(apiCalls(calls).map((call) => call.authorization)).toEqual([
            'Bearer pass-1',
            'Bearer pass-2',
        ]);
        expect(store.takeFallbackReport()).toBe('unauthorized');
    });

    it('stays on the route when a refresh only yields a nearly expired pass', async () => {
        const { calls, fetchSpy } = mockFetch([401], [300_000, 3_000]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore('/~gitbook/search-prewarm', target);
        await store.warmUp();

        expect(await search(store)).toBeNull();
        expect(store.takeFallbackReport()).toBe('refresh_failed');
        expect(await search(store)).toBeNull();
        expect(apiCalls(calls)).toHaveLength(1);
        expect(calls.filter((call) => call.url === '/~gitbook/search-prewarm')).toHaveLength(2);
    });

    it('does not retry with the rejected pass when the refresh fails', async () => {
        const { calls, fetchSpy } = mockFetch([401], [], [200, 500]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore('/~gitbook/search-prewarm', target);
        await store.warmUp();

        expect(await search(store)).toBeNull();
        expect(apiCalls(calls)).toHaveLength(1);
        expect(store.takeFallbackReport()).toBe('refresh_failed');
        expect(store.takeFallbackReport()).toBeUndefined();
    });

    it('uses the retried answer when the refreshed pass is accepted', async () => {
        const { fetchSpy } = mockFetch([401, 200]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore('/~gitbook/search-prewarm', target);
        await store.warmUp();

        expect(await search(store)).toEqual([]);
        expect(store.takeFallbackReport()).toBeUndefined();
    });

    it('does not retry or fall back when the search is aborted', async () => {
        const { calls, fetchSpy } = mockFetch([]);
        restore = () => fetchSpy.mockRestore();
        const store = createSearchPassStore('/~gitbook/search-prewarm', target);
        await store.warmUp();

        const controller = new AbortController();
        controller.abort();
        await expect(search(store, controller.signal)).rejects.toThrow();

        expect(apiCalls(calls)).toHaveLength(1);
        expect(store.takeFallbackReport()).toBeUndefined();
    });
});
