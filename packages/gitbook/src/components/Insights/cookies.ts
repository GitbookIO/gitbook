'use client';

import { getBrowserCookie, setBrowserCookie } from '@/lib/browser';

const GRANTED_COOKIE = '__gitbook_cookie_granted';

/**
 * Accept or reject cookies.
 */
export function setCookiesTracking(enabled: boolean) {
    setBrowserCookie(GRANTED_COOKIE, enabled ? 'yes' : 'no', {
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
    const state = getBrowserCookie(GRANTED_COOKIE);

    if (state === 'yes') {
        return false;
    }
    if (state === 'no') {
        return true;
    }

    return undefined;
}
