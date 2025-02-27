import { fetchSiteContextByURL, getBaseContext } from '@v2/lib/context';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL } from '@v2/lib/env';
import { MiddlewareHeaders } from '@v2/lib/middleware';
import { headers } from 'next/headers';

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
    const headersSet = await headers();

    return fetchSiteContextByURL(
        getBaseContext({
            siteURL,
            urlMode: getModeFromParams(params.mode),
            apiToken: headersSet.get(MiddlewareHeaders.APIToken) ?? GITBOOK_API_TOKEN,
            apiEndpoint: headersSet.get(MiddlewareHeaders.APIEndpoint) ?? GITBOOK_API_URL,
        }),
        {
            url: siteURL.toString(),
            visitorAuthToken: headersSet.get(MiddlewareHeaders.VisitorToken),

            // TODO: set it only when the token comes from the cookies.
            redirectOnError: true,
        }
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
