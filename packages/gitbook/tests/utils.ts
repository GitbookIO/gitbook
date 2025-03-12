import { GitBookAPI } from '@gitbook/api';

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
 * Get an API token for a site by its URL.
 */
export async function getSiteAPIToken(url: string) {
    const api = new GitBookAPI({
        endpoint: 'https://api.gitbook.com/cache',
    });
    const { data } = await api.urls.getPublishedContentByUrl({
        url,
    });

    if ('redirect' in data) {
        throw new Error(`Invalid site URL, it resulted in a redirect: ${data.redirect}`);
    }

    return data;
}
