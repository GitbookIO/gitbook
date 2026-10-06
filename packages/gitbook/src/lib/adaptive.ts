import { jwtDecode } from 'jwt-decode';

import type { SiteAPIToken } from '@gitbook/api';

import type { SiteURLData } from '@/lib/context';

/**
 * Claims about the visitor, stored in the VA and auth token.
 */
export type VisitorAuthClaims = Record<string, any>;

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
 * Whether the visitor is authenticated, i.e. has claims beyond the unsigned ones anyone can set.
 */
export function isVisitorAuthenticated(claims: VisitorAuthClaims): boolean {
    return Object.keys(claims).some((key) => key !== 'unsigned');
}
