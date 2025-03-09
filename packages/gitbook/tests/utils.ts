/**
 * Get the base URL of the deployment to test.
 */
export function getBaseURL() {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
        throw new Error('BASE_URL is not set');
    }

    return baseUrl;
}

/**
 * Get the site base URL of the deployment to test.
 */
export function getSiteBaseURL() {
    const siteBaseUrl = process.env.SITE_BASE_URL;
    if (!siteBaseUrl) {
        return getBaseURL();
    }

    return siteBaseUrl;
}

export function getContentPathName(input: string): string {
    const contentUrl = new URL(input);
    return `${contentUrl.host}${contentUrl.pathname}`;
}

/**
 * Get the URL to load for a content
 */
export function getContentTestURL(input: string): string {
    const url = new URL(getSiteBaseURL());
    const contentUrl = new URL(input);

    url.pathname = `${url.pathname.replace(/\/$/, '')}/${contentUrl.host}${contentUrl.pathname}`;
    url.search = contentUrl.search;

    return url.toString();
}
