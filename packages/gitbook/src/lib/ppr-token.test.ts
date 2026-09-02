import { afterEach, describe, expect, it, mock } from 'bun:test';
import {
    type WorkStore,
    workAsyncStorage,
} from 'next/dist/server/app-render/work-async-storage.external';

import { PPR_TOKEN_SCOPE, exchangePPRToken } from './ppr-token';
import { DataFetcherError } from '@/lib/data/errors';
import { GITBOOK_EXCHANGE_TOKEN_URL } from '@/lib/env';

const realFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = realFetch;
});

function mockFetch(handler: (input: RequestInfo | URL, init?: RequestInit) => Response) {
    const calls: { url: string; body: unknown }[] = [];
    globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
        calls.push({ url: String(input), body: JSON.parse(String(init?.body)) });
        return handler(input, init);
    }) as unknown as typeof fetch;
    return calls;
}

describe('PPR_TOKEN_SCOPE', () => {
    it('maps every PPR cache scope to the claims bucket it resolves', () => {
        expect(PPR_TOKEN_SCOPE).toEqual({ header: 'site', toc: 'revision', body: 'page' });
    });
});

describe('exchangePPRToken', () => {
    it('posts the token and scope, and returns the exchanged token', async () => {
        for (const scope of ['site', 'revision', 'page', 'full'] as const) {
            const calls = mockFetch(() => Response.json({ token: `exchanged-${scope}` }));

            expect(await exchangePPRToken(`revalidation-token-${scope}`, scope)).toBe(
                `exchanged-${scope}`
            );
            expect(calls).toEqual([
                {
                    url: GITBOOK_EXCHANGE_TOKEN_URL,
                    body: { token: `revalidation-token-${scope}`, scope },
                },
            ]);
        }
    });

    it('fails with a 502 when the endpoint rejects the token', async () => {
        mockFetch(() => Response.json({ error: 'Invalid or expired token' }, { status: 401 }));

        const error = await exchangePPRToken('rejected-token', 'site').catch((e) => e);
        expect(error).toBeInstanceOf(DataFetcherError);
        expect((error as DataFetcherError).code).toBe(502);
    });

    it('fails with a 502 when the endpoint returns no token', async () => {
        mockFetch(() => Response.json({}));

        const error = await exchangePPRToken('tokenless-response', 'revision').catch((e) => e);
        expect(error).toBeInstanceOf(DataFetcherError);
        expect((error as DataFetcherError).code).toBe(502);
    });

    it('fails with a 502 when the endpoint is unreachable', async () => {
        globalThis.fetch = mock(async () => {
            throw new TypeError('fetch failed');
        }) as unknown as typeof fetch;

        const error = await exchangePPRToken('unreachable', 'page').catch((e) => e);
        expect(error).toBeInstanceOf(DataFetcherError);
        expect((error as DataFetcherError).code).toBe(502);
    });

    it('exchanges each scope separately', async () => {
        const calls = mockFetch(() => Response.json({ token: 'exchanged' }));

        await Promise.all([
            exchangePPRToken('shared-token', 'site'),
            exchangePPRToken('shared-token', 'revision'),
        ]);

        expect(calls.map((call) => call.body)).toEqual([
            { token: 'shared-token', scope: 'site' },
            { token: 'shared-token', scope: 'revision' },
        ]);
    });

    // The memo lives on the server context, keyed on the work store of the request, so it is also
    // what a cache fill sees.
    it('reuses an exchange within a request', async () => {
        const calls = mockFetch(() => Response.json({ token: 'exchanged' }));

        await workAsyncStorage.run({} as WorkStore, async () => {
            await exchangePPRToken('shared-token', 'site');
            await exchangePPRToken('shared-token', 'site');
        });

        expect(calls).toHaveLength(1);
    });
});
