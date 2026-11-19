import { afterEach, describe, expect, it, spyOn } from 'bun:test';

import { GITBOOK_PREVIEW_BASE_URL } from '../env';
import * as api from './api';
import { DataFetcherError } from './errors';
import { lookupPublishedContentByUrl } from './lookup';

describe('preview auth redirects', () => {
    afterEach(() => {
        apiClientSpy?.mockRestore();
    });

    let apiClientSpy: ReturnType<typeof spyOn> | undefined;

    it.each([
        'site_foo/~/changes/66',
        'site_foo/~/revisions/revision_123',
        'site_foo',
        'site_foo/~/changes/66/hello%20world?theme=dark&value=a%26b&value=c%2Bd',
        'site_foo/~/revisions/revision_123/guide?next=%2Fsome%3Fpath%3D1&empty=',
        'site_foo?theme=dark',
    ])('preserves the requested URL for %s', async (path) => {
        const requestURL = new URL(path, GITBOOK_PREVIEW_BASE_URL);
        const authURL = new URL('https://app.gitbook.com/o/org_foo/sites/site_foo/preview/auth');
        apiClientSpy = spyOn(api, 'apiClient').mockReturnValue({
            urls: {
                async resolvePublishedContentByUrl({ url }: { url: string }) {
                    // The API uses the lookup URL as the return target for preview authentication.
                    const redirect = new URL(authURL);
                    redirect.searchParams.set('redirect', url);
                    return { data: { target: 'application', redirect: redirect.toString() } };
                },
            },
        } as ReturnType<typeof api.apiClient>);

        const result = await lookupPublishedContentByUrl({
            url: requestURL.toString(),
            apiToken: null,
            redirectOnError: false,
            visitorPayload: {},
        });

        expect(result.error).toBeUndefined();
        if (!result.data || !('redirect' in result.data)) {
            throw new Error('Expected an authentication redirect');
        }
        const redirect = new URL(result.data.redirect);
        expect(redirect.origin + redirect.pathname).toBe(authURL.toString());
        expect(redirect.searchParams.get('redirect')).toBe(requestURL.toString());
    });
});

describe('lookup URL', () => {
    it('sends change request URLs in full and keeps the redirect of the API', async () => {
        const urls: string[] = [];
        const redirect = new URL(
            'site_foo/section/~/changes/66/hello%20world',
            GITBOOK_PREVIEW_BASE_URL
        ).toString();
        const apiClientSpy = spyOn(api, 'apiClient').mockReturnValue({
            urls: {
                async resolvePublishedContentByUrl({ url }: { url: string }) {
                    urls.push(url);
                    return { data: { target: 'content', redirect } };
                },
            },
        } as unknown as ReturnType<typeof api.apiClient>);

        try {
            const result = await lookupPublishedContentByUrl({
                url: 'https://docs.example.com/section/~/changes/66/hello%20world?jwt_token=abc',
                apiToken: null,
                redirectOnError: false,
                visitorPayload: {},
            });
            expect(result).toEqual({ data: { target: 'content', redirect } });
        } finally {
            apiClientSpy.mockRestore();
        }

        expect(urls).toEqual(['https://docs.example.com/section/~/changes/66/hello%20world']);
    });

    it('resolves the full URL without search params in a single call', async () => {
        const urls: string[] = [];
        const apiClientSpy = spyOn(api, 'apiClient').mockReturnValue({
            urls: {
                async resolvePublishedContentByUrl({ url }: { url: string }) {
                    urls.push(url);
                    return { data: { target: 'external', redirect: 'https://example.com' } };
                },
            },
        } as unknown as ReturnType<typeof api.apiClient>);

        try {
            await lookupPublishedContentByUrl({
                url: 'https://docs.example.com/v/variant/a/b/c/d/e?theme=dark',
                apiToken: null,
                redirectOnError: false,
                visitorPayload: {},
            });
        } finally {
            apiClientSpy.mockRestore();
        }

        expect(urls).toEqual(['https://docs.example.com/v/variant/a/b/c/d/e']);
    });

    it('returns the API error', async () => {
        const apiClientSpy = spyOn(api, 'apiClient').mockReturnValue({
            urls: {
                async resolvePublishedContentByUrl() {
                    throw new DataFetcherError('Not found', 404);
                },
            },
        } as unknown as ReturnType<typeof api.apiClient>);

        try {
            const result = await lookupPublishedContentByUrl({
                url: 'https://docs.example.com/a',
                apiToken: null,
                redirectOnError: false,
                visitorPayload: {},
            });
            expect(result.error?.code).toBe(404);
        } finally {
            apiClientSpy.mockRestore();
        }
    });
});

describe('visitor payload', () => {
    it('forwards the visitor country to the API', async () => {
        const calls: { visitor?: unknown }[] = [];
        const apiClientSpy = spyOn(api, 'apiClient').mockReturnValue({
            urls: {
                async resolvePublishedContentByUrl(body: { visitor?: unknown }) {
                    calls.push(body);
                    return { data: { target: 'external', redirect: 'https://example.com' } };
                },
            },
        } as unknown as ReturnType<typeof api.apiClient>);

        try {
            await lookupPublishedContentByUrl({
                url: 'https://docs.example.com',
                apiToken: null,
                redirectOnError: false,
                visitorPayload: { type: 'human', country: 'FR' },
            });
        } finally {
            apiClientSpy.mockRestore();
        }

        expect(calls[0]?.visitor).toEqual({ type: 'human', country: 'FR' });
    });
});
