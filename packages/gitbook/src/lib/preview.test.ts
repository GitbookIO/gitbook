import { describe, expect, it } from 'bun:test';

import type { PublishedSiteContent } from '@gitbook/api';

import {
    getPreviewCookieResponse,
    getPreviewRequestIdentifier,
    getPublishedPreviewRedirectURL,
    isPreviewRequest,
    isPublishedPreviewAllowed,
    parsePreviewCustomizationCookie,
    serializePreviewCustomizationCookie,
} from './preview';

describe('isPreviewRequest', () => {
    it('should return true for preview requests', () => {
        const previewRequestURL = new URL('https://sites.gitbook.com/preview/site_foo/hello/world');
        expect(isPreviewRequest(previewRequestURL)).toBe(true);
    });

    it('should return false for non-preview requests', () => {
        const nonPreviewRequestURL1 = new URL('https://example.com/docs/foo/hello/world');
        expect(isPreviewRequest(nonPreviewRequestURL1)).toBe(false);

        const previewRequestURL2 = new URL('https://preview/site_foo/hello/world');
        expect(isPreviewRequest(previewRequestURL2)).toBe(false);
    });
});

describe('getPreviewRequestIdentifier', () => {
    it('should return the correct identifier for preview requests', () => {
        const previewRequestURL = new URL('https://sites.gitbook.com/preview/site_foo/hello/world');
        expect(getPreviewRequestIdentifier(previewRequestURL)).toBe('site_foo');
    });
});

describe('getPreviewCookieResponse', () => {
    // The site's canonical base path — deliberately different from the preview route prefix so the
    // test fails if the cookie is scoped to it instead of the preview route.
    const siteURLData = { siteBasePath: '/docs/' } as unknown as PublishedSiteContent;

    it('scopes the cookie to the preview route prefix in url-host mode, not the site base path', () => {
        const cookie = getPreviewCookieResponse({
            name: 'gitbook-customization',
            value: 'v',
            mode: 'url-host',
            siteRequestURL: new URL('https://sites.gitbook.com/preview/site_foo/hello/world'),
            siteURLData,
        });
        expect(cookie.options?.path).toBe('/preview/site_foo');
        expect(cookie.options?.sameSite).toBe('lax');
    });

    it('scopes the cookie to the proxied preview route prefix in url mode', () => {
        const cookie = getPreviewCookieResponse({
            name: 'gitbook-customization',
            value: 'v',
            mode: 'url',
            siteRequestURL: new URL('https://sites.gitbook.com/preview/site_foo/hello/world'),
            siteURLData,
        });
        expect(cookie.options?.path).toBe('/url/sites.gitbook.com/preview/site_foo');
    });

    it('falls back to the site base path for a non-preview url-host request', () => {
        const cookie = getPreviewCookieResponse({
            name: 'gitbook-customization',
            value: 'v',
            mode: 'url-host',
            siteRequestURL: new URL('https://example.com/docs/hello/world'),
            siteURLData,
        });
        expect(cookie.options?.path).toBe('/docs/');
    });
});

describe('parsePreviewCustomizationCookie', () => {
    const customization = "(styling:(primaryColor:(dark:'#ff0000',light:'#ff0000')))";
    const value = serializePreviewCustomizationCookie({ customization, siteSpace: 'sitesp_a' });

    it('returns the override for the site space it was created for', () => {
        expect(parsePreviewCustomizationCookie(value, 'sitesp_a')).toBe(customization);
    });

    it('ignores the override for another site space', () => {
        expect(parsePreviewCustomizationCookie(value, 'sitesp_b')).toBeUndefined();
        expect(parsePreviewCustomizationCookie(value, 'sitesp')).toBeUndefined();
    });

    it('ignores a cookie not bound to a site space', () => {
        expect(
            parsePreviewCustomizationCookie(encodeURIComponent(customization), 'sitesp_a')
        ).toBeUndefined();
    });
});

describe('isPublishedPreviewAllowed', () => {
    const disabled = { publicChangeRequestPreviews: false };

    it('refuses change requests and revisions on the published site when disabled', () => {
        expect(
            isPublishedPreviewAllowed({ ...disabled, preview: false, changeRequest: '458' })
        ).toBe(false);
        expect(isPublishedPreviewAllowed({ ...disabled, preview: false, revision: 'rev' })).toBe(
            false
        );
    });

    it('allows previews inside GitBook, live pages and sites without the setting', () => {
        expect(
            isPublishedPreviewAllowed({ ...disabled, preview: true, changeRequest: '458' })
        ).toBe(true);
        expect(isPublishedPreviewAllowed({ ...disabled, preview: false })).toBe(true);
        expect(isPublishedPreviewAllowed({ preview: false, changeRequest: '458' })).toBe(true);
    });
});

describe('getPublishedPreviewRedirectURL', () => {
    const siteSpacePreviewURL = 'https://sites.gitbook.com/preview/site_a/api/v2/';

    it('adds the change request or revision and the page path to the site space preview URL', () => {
        expect(
            getPublishedPreviewRedirectURL({
                siteSpacePreviewURL,
                changeRequest: '458',
                pathname: '/getting-started/install',
            })?.toString()
        ).toBe(
            'https://sites.gitbook.com/preview/site_a/api/v2/~/changes/458/getting-started/install'
        );
        expect(
            getPublishedPreviewRedirectURL({
                siteSpacePreviewURL,
                revision: 'rev_1',
                pathname: '/',
            })?.toString()
        ).toBe('https://sites.gitbook.com/preview/site_a/api/v2/~/revisions/rev_1');
    });

    it('returns null without a site space preview URL', () => {
        expect(
            getPublishedPreviewRedirectURL({
                siteSpacePreviewURL: undefined,
                changeRequest: '458',
                pathname: '/',
            })
        ).toBeNull();
    });
});
