'use client';

import * as cookies from '@/lib/cookies';

const GRANTED_COOKIE = '__gitbook_cookie_granted';

/**
 * Accept or reject cookies.
 */
export function setCookiesTracking(enabled: boolean) {
    cookies.set(GRANTED_COOKIE, enabled ? 'yes' : 'no', {
        expires: 365,
        sameSite: 'none',
        secure: true,
    });
}

/**
 * Return true if cookies are accepted or not.
 * Return `undefined` if state is not known.
 */
export function isCookiesTrackingDisabled() {
    const state = cookies.get(GRANTED_COOKIE);

    if (state === 'yes') {
        return false;
    }
    if (state === 'no') {
        return true;
    }

    return undefined;
}
