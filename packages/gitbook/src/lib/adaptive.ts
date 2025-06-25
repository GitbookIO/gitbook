import type { SiteURLData } from '@/lib/context';
import type { SiteAPIToken } from '@gitbook/api';
import { jwtDecode } from 'jwt-decode';

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
