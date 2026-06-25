import { afterEach, describe, expect, it, mock } from 'bun:test';

import { lookupPublishedContentByUrl } from './lookup';

const originalFetch = globalThis.fetch;

describe('lookupPublishedContentByUrl', () => {
    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it('forwards the provided GitBook visitor session cookie to published URL resolution', async () => {
        globalThis.fetch = mock(() =>
            Promise.resolve(
                Response.json(
                    {
                        site: 'site-id',
                        siteSpace: 'site-space-id',
                        siteBasePath: '',
                        basePath: '',
                        space: 'space-id',
                        organization: 'organization-id',
                        apiToken: 'api-token',
                        canonicalUrl: 'https://docs.gitbook.com/',
                        pathname: '',
                        complete: true,
                    },
                    {
                        headers: {
                            'cache-control': 'private, no-store',
                        },
                    }
                )
            )
        );

        const result = await lookupPublishedContentByUrl({
            url: 'https://docs.gitbook.com/',
            redirectOnError: false,
            apiToken: null,
            visitorPayload: {},
            cookieHeader: '__session=session-value',
        });

        expect(result.error).toBeUndefined();
        expect(result.data).toMatchObject({
            site: 'site-id',
            apiToken: 'api-token',
        });
        if (result.error) {
            throw new Error(result.error.message);
        }
        expect(result.headers?.cacheControl).toBe('private, no-store');
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        const [, init] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] ?? [];
        const headers = new Headers(init?.headers);
        expect(headers.get('cookie')).toBe('__session=session-value');
    });
});
