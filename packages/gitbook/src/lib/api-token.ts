import { jwtDecode } from 'jwt-decode';

import type { SiteAPIToken } from '@gitbook/api';

/**
 * Refresh slightly ahead of the real expiry so the token survives the rest of the request.
 * The API mints tokens on a UTC-midnight bucket that stay valid until 00:05 the next day, so this
 * margin must stay under that 5min overlap: outside it, a refresh returns the very same token.
 */
const EXPIRATION_MARGIN_SECONDS = 120;

/**
 * Check if a site API token is expired, or about to expire.
 */
export function isAPITokenExpired(apiToken: string): boolean {
    try {
        const decoded = jwtDecode<SiteAPIToken & { exp?: number }>(apiToken);
        return (
            typeof decoded.exp === 'number' &&
            decoded.exp < Date.now() / 1000 + EXPIRATION_MARGIN_SECONDS
        );
    } catch {
        // A token we cannot decode is not one we can refresh.
        return false;
    }
}
