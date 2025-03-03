import {
    fetchSiteContextByURL,
    fetchSiteContextByURLLookup,
    getBaseContext,
} from '@v2/lib/context';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';

export type RouteParamMode = 'url-host' | 'url';

export type RouteLayoutParams = {
    mode: string;

    /** URL encoded site URL */
    siteURL: string;
};

export type RouteParams = RouteLayoutParams & {
    pagePath: string;
};

/**
 * Get the static context when rendering statically a site.
 */
export function getStaticSiteContext(params: RouteLayoutParams) {
    const siteURL = getSiteURLFromParams(params);
    return fetchSiteContextByURL(
        getBaseContext({
            siteURL,
            urlMode: getModeFromParams(params.mode),
        }),
        {
            url: siteURL.toString(),
            visitorAuthToken: null,
            redirectOnError: false,
        }
    );
}

/**
 * Get the site context when rendering dynamically.
 * The context will depend on the request.
 */
export async function getDynamicSiteContext(params: RouteLayoutParams) {
    const siteURL = getSiteURLFromParams(params);
    const siteURLData = await getSiteURLDataFromMiddleware();

    return fetchSiteContextByURLLookup(
        getBaseContext({
            siteURL,
            urlMode: getModeFromParams(params.mode),
        }),
        siteURLData
    );
}

/**
 * Get the decoded page path from the params.
 */
export function getPagePathFromParams(params: RouteParams) {
    const decoded = decodeURIComponent(params.pagePath);
    return decoded;
}

function getSiteURLFromParams(params: RouteLayoutParams) {
    const decoded = decodeURIComponent(params.siteURL);
    const url = new URL(`https://${decoded}`);
    return url;
}

function getModeFromParams(mode: string): RouteParamMode {
    if (mode === 'url-host') {
        return 'url-host';
    }

    return 'url';
}
