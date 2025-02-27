import { headers } from 'next/headers';
import { type GitBookBaseContext, fetchSiteContextByURL, getBaseContext } from './context';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL } from './env';
import { MiddlewareHeaders, getURLModeFromMiddleware } from './middleware';

/**
 * Get the base context for a server action.
 */
export async function getServerActionBaseContext() {
    const headersSet = await headers();
    const siteURL = headersSet.get(MiddlewareHeaders.SiteURL);

    if (!siteURL) {
        throw new Error('Site URL is not set by the middleware');
    }

    const urlMode = await getURLModeFromMiddleware();
    return getBaseContext({
        siteURL,
        urlMode,
        apiToken: headersSet.get(MiddlewareHeaders.APIToken) ?? GITBOOK_API_TOKEN,
        apiEndpoint: headersSet.get(MiddlewareHeaders.APIEndpoint) ?? GITBOOK_API_URL,
    });
}

/**
 * Fetch the context for a site in a server action.
 * The server action is always dynamic and the request is passed through the middleware.
 */
export async function fetchServerActionSiteContext(baseContext: GitBookBaseContext) {
    const headersSet = await headers();
    const visitorAuthToken = headersSet.get(MiddlewareHeaders.VisitorToken);
    const siteURL = headersSet.get(MiddlewareHeaders.SiteURL);

    if (!siteURL) {
        throw new Error('Site URL is not set by the middleware');
    }

    return fetchSiteContextByURL(baseContext, {
        url: siteURL,
        visitorAuthToken,
        redirectOnError: true,
    });
}
