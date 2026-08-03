import { jwtDecode } from 'jwt-decode';
import { forbidden, notFound } from 'next/navigation';
import rison from 'rison';

import type { SiteAPIToken } from '@gitbook/api';

import {
    getPPRVisitorAuthClaimsFromToken,
    getVisitorAuthClaims,
    getVisitorAuthClaimsFromToken,
} from '@/lib/adaptive';
import { type SiteURLData, fetchSiteContextByURLLookup, getBaseContext } from '@/lib/context';
import { getDynamicCustomizationSettings } from '@/lib/customization';

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

export type PPRRouteLayoutParams = RouteLayoutParams & {
    revisionId: string;
    revalidationId: string;
    pprDefaults: string;
};

export type PPRRouteParams = PPRRouteLayoutParams & {
    pagePath: string;
};

/**
 * Get the static context when rendering statically a site.
 */
export async function getStaticSiteContext(
    params: RouteLayoutParams,
    getClaims = getVisitorAuthClaimsFromToken
) {
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
        visitorAuthClaims: getClaims(decoded),
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
    // If decoding the param fails, return a 404 instead of crashing
    try {
        const decoded = decodeURIComponent(params.pagePath);

        // For the root page, we encode '/' to avoid an empty param being passed.
        if (decoded === '/') {
            return '';
        }
        return decoded;
    } catch (error) {
        console.error(
            `Returning 404 after failing to decode page path ${params.pagePath}: ${error}`
        );
        notFound();
    }
}

function getSiteURLFromParams(params: RouteLayoutParams) {
    try {
        const decoded = decodeURIComponent(params.siteURL);
        const url = new URL(`https://${decoded}`);
        return url;
    } catch (error) {
        console.error(`Returning 404 after failing to decode site URL ${params.siteURL}: ${error}`);
        notFound();
    }
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
export function getSiteURLDataFromParams(params: RouteLayoutParams): SiteURLData {
    try {
        const decoded = decodeURIComponent(params.siteData);
        return rison.decode(decoded);
    } catch (error) {
        console.error(
            `Returning 404 after failing to decode site data ${params.siteData}: ${error}`
        );
        notFound();
    }
}

export function getPPRRouteParams(params: PPRRouteParams): RouteParams;
export function getPPRRouteParams(params: PPRRouteLayoutParams): RouteLayoutParams;
/**
 * Project PPR route params for the current page, without PPR-only cache inputs.
 */
export function getPPRRouteParams(params: PPRRouteLayoutParams): RouteLayoutParams {
    const { revisionId, revalidationId, pprDefaults: _, ...routeParams } = params;
    const siteURLData = getSiteURLDataFromParams(params);

    return {
        ...routeParams,
        siteData: encodeURIComponent(
            rison.encode({
                ...siteURLData,
                revision: getPPRRouteParam(revisionId, 'revision ID'),
                revalidationId: getPPRRouteParam(revalidationId, 'revalidation ID'),
            })
        ),
    };
}

/**
 * Project PPR params for the shared header by replacing page-varying location data.
 */
export function getPPRHeaderRouteParams(params: PPRRouteLayoutParams): RouteLayoutParams {
    const routeParams = getPPRRouteParams(params);
    const siteURLData = getSiteURLDataFromParams(routeParams);
    const defaults = getPPRDefaults(params);

    return {
        ...routeParams,
        siteData: encodeURIComponent(
            rison.encode({
                ...siteURLData,
                pathname: '/',
                siteSection: defaults.siteSection ?? undefined,
                siteSpace: defaults.siteSpace,
                space: defaults.space,
            })
        ),
    };
}

/**
 * Project PPR params for the table of contents, keeping its current location data.
 */
export function getPPRTableOfContentsRouteParams(params: PPRRouteLayoutParams): RouteLayoutParams {
    return getPPRRouteParams(params);
}

export async function getPPRStaticSiteContext(params: RouteLayoutParams) {
    return getStaticSiteContext(params, getPPRVisitorAuthClaimsFromToken);
}

function getPPRRouteParam(encodedParam: string, name: string): string {
    try {
        return decodeURIComponent(encodedParam);
    } catch (error) {
        console.error(`Returning 404 after failing to decode PPR ${name}: ${error}`);
        notFound();
    }
}

type PPRDefaults = {
    siteSection: string | null;
    siteSpace: string;
    space: string;
};

function getPPRDefaults(params: PPRRouteLayoutParams): PPRDefaults {
    try {
        const defaults: unknown = rison.decode(decodeURIComponent(params.pprDefaults));
        if (
            !defaults ||
            typeof defaults !== 'object' ||
            Array.isArray(defaults) ||
            !('siteSection' in defaults) ||
            !('siteSpace' in defaults) ||
            !('space' in defaults) ||
            (defaults.siteSection !== null && typeof defaults.siteSection !== 'string') ||
            typeof defaults.siteSpace !== 'string' ||
            !defaults.siteSpace ||
            typeof defaults.space !== 'string' ||
            !defaults.space
        ) {
            notFound();
        }

        return defaults as PPRDefaults;
    } catch (error) {
        console.error(`Returning 404 after failing to decode PPR defaults: ${error}`);
        notFound();
    }
}
