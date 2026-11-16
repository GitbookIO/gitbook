import { afterEach, describe, expect, it, mock } from 'bun:test';

import { createDataFetcher } from './api';

const originalFetch = globalThis.fetch;

describe('searchSiteContent', () => {
    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    function mockFetch(impl: (input: unknown, init?: RequestInit) => Promise<Response>) {
        globalThis.fetch = mock(impl) as unknown as typeof fetch;
    }

    function search(signal?: AbortSignal) {
        return createDataFetcher().searchSiteContent({
            organizationId: 'org-1',
            siteId: 'site-1',
            query: 'test',
            scope: { mode: 'all' },
            signal,
        });
    }

    it('returns the API results', async () => {
        mockFetch(async () => Response.json({ items: [] }));

        const result = await search();

        expect(result).toEqual({ data: [] });
    });

    it('returns an API error as a value', async () => {
        mockFetch(async () =>
            Response.json({ error: { code: 429, message: 'Namespace saturated' } }, { status: 429 })
        );

        const result = await search();

        expect(result.error?.code).toBe(429);
    });

    it('aborts the API call when the search is cancelled', async () => {
        let apiCallAborted = false;
        const { promise: apiCalled, resolve: onApiCall } = Promise.withResolvers<void>();
        mockFetch(
            (_input, init) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener('abort', () => {
                        apiCallAborted = true;
                        reject(init.signal?.reason);
                    });
                    setTimeout(() => reject(new Error('API call was not aborted')), 1000);
                    onApiCall();
                })
        );
        const controller = new AbortController();

        const result = search(controller.signal);
        await apiCalled;
        controller.abort();

        expect((await result).error?.code).toBe(499);
        expect(apiCallAborted).toBe(true);
    });
});
