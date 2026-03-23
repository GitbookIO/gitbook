import type { PublishedSiteContent } from '@gitbook/api';
import assertNever from 'assert-never';
import { assert } from 'ts-essentials';
import { GITBOOK_PREVIEW_BASE_URL } from './env';
import type { ResponseCookie } from './visitors';

/**
 * Check if the request to the site is a preview request.
 */
export function isPreviewRequest(requestURL: URL): boolean {
    const gitbookPreviewBaseURL = new URL(GITBOOK_PREVIEW_BASE_URL);
    return (
        requestURL.host === gitbookPreviewBaseURL.host &&
        requestURL.pathname.startsWith(gitbookPreviewBaseURL.pathname)
    );
}

/**
 * Get the preview request site identifier from the request URL.
 */
export function getPreviewRequestIdentifier(requestURL: URL): string {
    if (isPreviewRequest(requestURL)) {
        const siteIdentifier = requestURL.pathname.split('/').filter(Boolean)[1];
        assert(siteIdentifier, 'Expected site identifier in preview URL');
        return siteIdentifier;
    }

    throw new Error('Not a preview request');
}

/**
 * Get a cookie for the preview request.
 */
export function getPreviewCookieResponse(args: {
    name: string;
    value: string;
    mode: 'url' | 'url-host';
    siteRequestURL: URL;
    siteURLData: PublishedSiteContent;
}): ResponseCookie {
    const { name, value, mode, siteRequestURL, siteURLData } = args;
    // Only send the cookie to preview routes and scope it to the specific site
    // to avoid conflicts between different sites previews potentially opened at the same time.
    const path = (() => {
        switch (mode) {
            case 'url': {
                const gitbookPreviewBaseURL = new URL(GITBOOK_PREVIEW_BASE_URL);
                const gitbookPreviewHostPath =
                    gitbookPreviewBaseURL.host + gitbookPreviewBaseURL.pathname.replace(/\/$/, '');
                return `/url/${gitbookPreviewHostPath}/${getPreviewRequestIdentifier(siteRequestURL)}`;
            }
            case 'url-host':
                return siteURLData.siteBasePath;
            default:
                assertNever(mode);
        }
    })();

    return {
        name,
        value,
        options: {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 10 * 60, // 10 minutes
            path,
        },
    };
}
