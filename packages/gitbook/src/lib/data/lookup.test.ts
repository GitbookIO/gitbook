import { afterEach, describe, expect, it, spyOn } from 'bun:test';

import type { PublishedSiteContentLookup } from '@gitbook/api';

import { GITBOOK_PREVIEW_BASE_URL } from '../env';
import * as api from './api';
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

    it.each([
        {
            name: 'non-preview application redirects',
            requestURL: 'https://docs.example.com/~/changes/66',
            target: 'application',
            redirect: 'https://app.gitbook.com/o/org_foo/sites/site_foo',
            expectedRedirect: 'https://app.gitbook.com/o/org_foo/sites/site_foo',
        },
        {
            name: 'preview content redirects with a remaining page path',
            requestURL: new URL(
                'site_foo/~/changes/66/hello%20world',
                GITBOOK_PREVIEW_BASE_URL
            ).toString(),
            target: 'content',
            redirect: 'https://docs.example.com/section?theme=dark',
            expectedRedirect: 'https://docs.example.com/section/hello%20world?theme=dark',
        },
        {
            name: 'preview external redirects with a remaining page path',
            requestURL: new URL(
                'site_foo/~/revisions/revision_123/hello%20world',
                GITBOOK_PREVIEW_BASE_URL
            ).toString(),
            target: 'external',
            redirect: 'https://auth.example.com/login?location=%2Fsection&state=keep',
            expectedRedirect:
                'https://auth.example.com/login?location=%2Fsection%2Fhello%2520world&state=keep',
        },
    ] as const)(
        'preserves handling of $name',
        async ({ requestURL, target, redirect, expectedRedirect }) => {
            const data: PublishedSiteContentLookup =
                target === 'external'
                    ? { target, redirect, site: 'site_foo' }
                    : { target, redirect };
            apiClientSpy = spyOn(api, 'apiClient').mockReturnValue({
                urls: {
                    async resolvePublishedContentByUrl() {
                        return { data };
                    },
                },
            } as unknown as ReturnType<typeof api.apiClient>);

            const result = await lookupPublishedContentByUrl({
                url: requestURL,
                apiToken: null,
                redirectOnError: false,
                visitorPayload: {},
            });

            expect(result).toEqual({ data: { ...data, redirect: expectedRedirect } });
        }
    );
});
