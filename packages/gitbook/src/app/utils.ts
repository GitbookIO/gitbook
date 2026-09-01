import { jwtDecode } from 'jwt-decode';
import { forbidden, notFound } from 'next/navigation';
import rison from 'rison';

import type { SiteAPIToken } from '@gitbook/api';

import {
    type VisitorAuthClaims,
    getVisitorAuthClaims,
    getVisitorAuthClaimsFromToken,
} from '@/lib/adaptive';
import type { PPRCacheScope } from '@/lib/cache-tags';
import { type SiteURLData, fetchSiteContextByURLLookup, getBaseContext } from '@/lib/context';
import { getDynamicCustomizationSettings } from '@/lib/customization';
import { PPR_TOKEN_SCOPE, type PPRTokenScope, exchangePPRToken } from '@/lib/ppr-token';

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
    options?: { pprScope?: PPRCacheScope }
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
            ...(options?.pprScope ? { pprScope: options.pprScope } : {}),
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
            })
        ),
    };
}

/**
 * Project PPR params for the current page, with a token scoped to the page claims.
 */
export function getPPRPageRouteParams(params: PPRRouteParams): Promise<RouteParams>;
export function getPPRPageRouteParams(params: PPRRouteLayoutParams): Promise<RouteLayoutParams>;
export function getPPRPageRouteParams(params: PPRRouteLayoutParams): Promise<RouteLayoutParams> {
    return withExchangedPPRToken(getPPRRouteParams(params), PPR_TOKEN_SCOPE.body);
}

/**
 * Project PPR params for the shared header by replacing page-varying location data.
 */
export async function getPPRHeaderRouteParams(
    params: PPRRouteLayoutParams
): Promise<RouteLayoutParams> {
    const routeParams = getPPRRouteParams(params);
    const { revision, ...siteURLData } = getSiteURLDataFromParams(routeParams);
    const defaults = getPPRDefaults(params);

    return withExchangedPPRToken(
        {
            ...routeParams,
            siteData: encodeSiteData({
                ...siteURLData,
                // For the header, we keep site section and space data from the PPR defaults, so that the header can be cached across all pages in a site.
                siteSection: defaults.siteSection ?? undefined,
                siteSpace: defaults.siteSpace,
                space: defaults.space,
                // The base path has to describe the same variant as the ids above, or the header
                // prefixes one variant's page paths with another variant's base path. The site default
                // variant is published at the site root; defaults pointing at the visited variant keep
                // its own base path.
                basePath:
                    defaults.siteSpace === siteURLData.siteSpace
                        ? siteURLData.basePath
                        : siteURLData.siteBasePath,
            }),
        },
        PPR_TOKEN_SCOPE.header
    );
}

/** rison can't encode undefined values, so they are dropped like the middleware does. */
function encodeSiteData(siteURLData: Record<string, unknown>): string {
    return encodeURIComponent(
        rison.encode(
            Object.fromEntries(
                Object.entries(siteURLData).filter(([_, value]) => typeof value !== 'undefined')
            )
        )
    );
}

/**
 * Project PPR params for the table of contents, keeping its current location data.
 * The table of contents depends only on the space you're in and the claims of that revision, not on the page,
 * and the layout params carry no page path, so only the token has to be narrowed.
 */
export function getPPRTableOfContentsRouteParams(
    params: PPRRouteLayoutParams
): Promise<RouteLayoutParams> {
    return withExchangedPPRToken(getPPRRouteParams(params), PPR_TOKEN_SCOPE.toc);
}

/**
 * Replace the revalidation token carried by the PPR params with a content API token narrowed to
 * `scope`. Components sharing a scope then share a token, and with it a cache entry.
 */
async function withExchangedPPRToken<T extends RouteLayoutParams>(
    params: T,
    scope: PPRTokenScope
): Promise<T> {
    const siteURLData = getSiteURLDataFromParams(params);

    return {
        ...params,
        siteData: encodeSiteData({
            ...siteURLData,
            apiToken: await exchangePPRToken(siteURLData.apiToken, scope),
        }),
    };
}

/**
 * Get the claims the client should resolve adaptive content with. Each component holds a token
 * narrowed to a single scope, so the union has to come from a `full` exchange.
 */
export async function getPPRVisitorAuthClaims(
    params: PPRRouteLayoutParams
): Promise<VisitorAuthClaims> {
    const { apiToken } = getSiteURLDataFromParams(params);
    const fullToken = await exchangePPRToken(apiToken, 'full');

    return getVisitorAuthClaimsFromToken(jwtDecode<SiteAPIToken>(fullToken));
}

/**
 * Get the static context for a PPR component. The scope partitions the cache entries and scopes
 * the tags they emit, so the component and its data are revalidated as one unit.
 */
export async function getPPRStaticSiteContext(params: RouteLayoutParams, pprScope: PPRCacheScope) {
    return getStaticSiteContext(params, { pprScope });
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
    let defaults: unknown;
    try {
        defaults = rison.decode(decodeURIComponent(params.pprDefaults));
    } catch (error) {
        console.error(`Returning 404 after failing to decode PPR defaults: ${error}`);
        notFound();
    }

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
        console.error(`Returning 404 after decoding invalid PPR defaults: ${params.pprDefaults}`);
        notFound();
    }

    return defaults as PPRDefaults;
}
