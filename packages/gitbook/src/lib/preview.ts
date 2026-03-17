import type { PublishedSiteContent } from '@gitbook/api';
import assertNever from 'assert-never';
import { assert } from 'ts-essentials';
import { GITBOOK_PREVIEW_BASE_URL } from './env';
import type { ResponseCookie } from './visitors';

/**
 * Check if the request to the site is a preview request.
 */
export function isPreviewRequest(requestURL: URL): boolean {
    // TODO: Remove the `requestURL.host === 'preview'` condition once we have fully migrated to the new preview URL structure.
    return (
        requestURL.host === 'preview' || requestURL.toString().startsWith(GITBOOK_PREVIEW_BASE_URL)
    );
}

export function getPreviewRequestIdentifier(requestURL: URL): string {
    if (requestURL.toString().startsWith(GITBOOK_PREVIEW_BASE_URL)) {
        const siteIdentifier = requestURL.pathname.split('/').filter(Boolean)[1];
        assert(siteIdentifier, 'Expected site identifier in preview URL');
        return siteIdentifier;
    }

    // TODO: Remove the `requestURL.host === 'preview'` condition once we have fully migrated to the new preview URL structure.
    // For preview requests, we extract the site ID from the pathname
    // e.g. https://preview/site_id/...
    const pathname = requestURL.pathname.slice(1).split('/');
    return pathname[0]!;
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
                const gitbookPreviewHost =
                    gitbookPreviewBaseURL.host + gitbookPreviewBaseURL.pathname.replace(/\/$/, '');
                // TODO: Remove support for 'preview' hostnames later.
                const host =
                    siteRequestURL.hostname === 'preview'
                        ? siteRequestURL.hostname
                        : gitbookPreviewHost;
                return `/url/${host}/${getPreviewRequestIdentifier(siteRequestURL)}`;
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
