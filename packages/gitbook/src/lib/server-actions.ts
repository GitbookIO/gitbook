import { type GitBookBaseContext, fetchSiteContextByURLLookup, getBaseContext } from './context';
import { getEmbeddableLinker } from './embeddable-linker';
import {
    getSiteURLDataFromMiddleware,
    getSiteURLFromMiddleware,
    getURLModeFromMiddleware,
} from './middleware';

/**
 * Get the base context for a server action.
 * This function should only be called in a server action.
 */
export async function getServerActionBaseContext(options?: { isEmbeddable?: boolean }) {
    const siteURL = await getSiteURLFromMiddleware();
    const siteURLData = await getSiteURLDataFromMiddleware();
    const urlMode = await getURLModeFromMiddleware();

    const context = getBaseContext({
        siteURL,
        siteURLData,
        urlMode,
    });

    if (options?.isEmbeddable) {
        return {
            ...context,
            linker: getEmbeddableLinker(context.linker),
        };
    }

    return context;
}

/**
 * Fetch the context for a site in a server action.
 * The server action is always dynamic and the request is passed through the middleware.
 */
export async function fetchServerActionSiteContext(baseContext: GitBookBaseContext) {
    const siteURLData = await getSiteURLDataFromMiddleware();
    return fetchSiteContextByURLLookup(baseContext, siteURLData);
}
