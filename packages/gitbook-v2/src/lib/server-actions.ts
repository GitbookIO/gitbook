import { type GitBookBaseContext, fetchSiteContextByURLLookup, getBaseContext } from './context';
import {
    getSiteURLDataFromMiddleware,
    getSiteURLFromMiddleware,
    getURLModeFromMiddleware,
} from './middleware';

/**
 * Get the base context for a server action.
 * This function should only be called in a server action.
 */
export async function getServerActionBaseContext() {
    const siteURL = await getSiteURLFromMiddleware();
    const siteURLData = await getSiteURLDataFromMiddleware();
    const urlMode = await getURLModeFromMiddleware();

    return getBaseContext({
        siteURL,
        siteURLData,
        urlMode,
    });
}

/**
 * Fetch the context for a site in a server action.
 * The server action is always dynamic and the request is passed through the middleware.
 */
export async function fetchServerActionSiteContext(baseContext: GitBookBaseContext) {
    const siteURLData = await getSiteURLDataFromMiddleware();
    return fetchSiteContextByURLLookup(baseContext, siteURLData);
}
