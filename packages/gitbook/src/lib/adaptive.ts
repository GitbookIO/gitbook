import { jwtDecode } from 'jwt-decode';

import type { SiteAPIToken } from '@gitbook/api';

import type { SiteURLData } from '@/lib/context';

/**
 * Claims about the visitor, stored in the VA and auth token.
 */
export type VisitorAuthClaims = Record<string, any>;

type PPRSiteAPIToken = SiteAPIToken & {
    siteStructureClaims?: VisitorAuthClaims;
    revisionClaims?: VisitorAuthClaims;
    pageClaims?: VisitorAuthClaims;
};

/**
 * Get the visitor auth claims from the API response obtained from `resolvePublishedContentByUrl`.
 */
export function getVisitorAuthClaims(siteData: SiteURLData): VisitorAuthClaims {
    const { apiToken } = siteData;

    return getVisitorAuthClaimsFromToken(jwtDecode<SiteAPIToken>(apiToken));
}

/**
 * Get the visitor auth claims from a decoded API token.
 */
export function getVisitorAuthClaimsFromToken(token: SiteAPIToken): VisitorAuthClaims {
    return token.claims ?? {};
}

/**
 * PPR shares its client contexts with the site structure, so it exposes the structure claims.
 */
export function getPPRVisitorAuthClaimsFromToken(token: PPRSiteAPIToken): VisitorAuthClaims {
    return token.siteStructureClaims ?? {};
}
