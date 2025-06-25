import { getVisitorAuthClaims, getVisitorAuthClaimsFromToken } from '@/lib/adaptive';
import { type SiteURLData, fetchSiteContextByURLLookup, getBaseContext } from '@/lib/context';
import { getDynamicCustomizationSettings } from '@/lib/customization';
import type { SiteAPIToken } from '@gitbook/api';
import { jwtDecode } from 'jwt-decode';
import { forbidden } from 'next/navigation';
import rison from 'rison';

export type RouteParamMode = 'url-host' | 'url';

export type RouteLayoutParams = {
    mode: string;

    /** URL encoded site URL */
    siteURL: string;

    /** URL and Rison encoded site data from resolvePublishedContentByUrl */
    siteData: string;
};

export type RouteParams = RouteLayoutParams & {
    pagePath: string;
};

/**
 * Get the static context when rendering statically a site.
 */
export async function getStaticSiteContext(params: RouteLayoutParams) {
    const siteURL = getSiteURLFromParams(params);
    const siteURLData = getSiteURLDataFromParams(params);

    // For static routes, we check the expiration of the JWT token
    // as the route might be revalidated after expiration
    const decoded = jwtDecode<SiteAPIToken & { exp: number }>(siteURLData.apiToken);
    if (decoded.exp && decoded.exp < Date.now() / 1000 + 120) {
        forbidden();
    }

    const context = await fetchSiteContextByURLLookup(
        getBaseContext({
            siteURL,
            siteURLData,
            urlMode: getModeFromParams(params.mode),
        }),
        siteURLData
    );

    return {
        context,
        visitorAuthClaims: getVisitorAuthClaimsFromToken(decoded),
    };
}

/**
 * Get the site context when rendering dynamically.
 * The context will depend on the request.
 */
export async function getDynamicSiteContext(params: RouteLayoutParams) {
    const siteURL = getSiteURLFromParams(params);
    const siteURLData = getSiteURLDataFromParams(params);

    const context = await fetchSiteContextByURLLookup(
        getBaseContext({
            siteURL,
            siteURLData,
            urlMode: getModeFromParams(params.mode),
        }),
        siteURLData
    );

    context.customization = await getDynamicCustomizationSettings(context.customization);

    return {
        context,
        visitorAuthClaims: getVisitorAuthClaims(siteURLData),
    };
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

/**
 * Get the decoded site data from the params.
 */
function getSiteURLDataFromParams(params: RouteLayoutParams): SiteURLData {
    const decoded = decodeURIComponent(params.siteData);
    return rison.decode(decoded);
}
