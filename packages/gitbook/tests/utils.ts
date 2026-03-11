import { GitBookAPI } from '@gitbook/api';
import { assert } from 'ts-essentials';

/**
 * Get the base URL of the deployment to test.
 */
function getBaseURL() {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
        throw new Error('BASE_URL is not set');
    }

    return baseUrl;
}

/**
 * Get the site base URL of the deployment to test.
 */
function getSiteBaseURL() {
    const siteBaseUrl = process.env.SITE_BASE_URL;
    if (!siteBaseUrl) {
        return getBaseURL();
    }

    return siteBaseUrl;
}

/**
 * Get the base URL of the deployment preview route to test.
 */
function getSitePreviewBaseURL() {
    const previewBaseUrl = process.env.SITE_PREVIEW_BASE_URL;
    assert(previewBaseUrl, 'SITE_PREVIEW_BASE_URL is not set');
    return previewBaseUrl;
}

/**
 * Get the URL to load for a site
 */
export function getContentTestURL(input: string): string {
    const url = new URL(getSiteBaseURL());
    const contentUrl = new URL(input);

    url.pathname = `${url.pathname.replace(/\/$/, '')}/${contentUrl.host}${contentUrl.pathname}`;
    url.search = contentUrl.search;

    return url.toString();
}

/**
 * Get the URL to load on the deployment being tested.
 */
export function getTestURL(urlRest: string): string {
    const url = new URL(urlRest, getBaseURL());
    return url.toString();
}

/**
 * Get the URL to load a site preview on the deployment being tested.
 */
export function getTestPreviewURL(urlRest: string): string {
    const url = new URL(urlRest, getSitePreviewBaseURL());
    return url.toString();
}

/**
 * Get the upstream GitBook preview URL for a preview route.
 */
export function getGitBookPreviewURL(urlRest: string): string {
    const gitbookPreviewBaseURL = process.env.GITBOOK_PREVIEW_BASE_URL;
    assert(gitbookPreviewBaseURL, 'GITBOOK_PREVIEW_BASE_URL is not set');
    const url = new URL(urlRest, gitbookPreviewBaseURL);
    return url.toString();
}

/**
 * Get an API token for a site by its URL.
 */
export async function getSiteAPIToken(url: string) {
    const api = new GitBookAPI({
        endpoint: 'https://api.gitbook.com/cache',
    });
    const { data } = await api.urls.resolvePublishedContentByUrl({
        url,
    });

    if ('redirect' in data) {
        throw new Error(`Invalid site URL, it resulted in a redirect: ${data.redirect}`);
    }

    return data;
}
