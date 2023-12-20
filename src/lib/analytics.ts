'use client';

import cookies from 'js-cookie';

const VISITORID_COOKIE = '__session';
const GRANTED_COOKIE = '__gitbook_cookie_granted';

let visitorId: string | null = null;
let pendingVisitorId: Promise<string> | null = null;

/**
 * Return the current visitor identifier.
 */
export async function getVisitorId(): Promise<string> {
    if (!visitorId) {
        if (!pendingVisitorId) {
            pendingVisitorId = fetchVisitorID().finally(() => {
                pendingVisitorId = null;
            });
        }

        visitorId = await pendingVisitorId;
    }

    return visitorId;
}

/**
 * Propose a visitor identifier to the GitBook.com server and get the devideId back.
 */
async function fetchVisitorID(): Promise<string> {
    const withoutCookies = isCookiesTrackingDisabled();

    if (withoutCookies) {
        return getNewVisitorId();
    }

    const existingTrackingCookie = cookies.get(VISITORID_COOKIE);

    if (existingTrackingCookie) {
        // If the cookie already exists, we'll just use that. Avoids a server request.
        return existingTrackingCookie;
    } else {
        // No tracking deviceId set, we'll need to consolidate with the server.
        const proposed = getNewVisitorId();

        const url = new URL(process.env.NEXT_PUBLIC_GITBOOK_APP_URL ?? `https://app.gitbook.com`);
        url.pathname = '/__session';
        url.searchParams.set('proposed', proposed);

        try {
            const resp = await fetch(url, {
                method: 'GET', // Use GET to play nicely with SameSite cookies.
                credentials: 'include', // Make sure to send/receive cookies.
                cache: 'no-cache',
                mode: 'cors', // Need to use cors as we are on a different domain.
            });

            const { deviceId } = await resp.json();
            return deviceId;
        } catch (error) {
            return proposed;
        }
    }
}

/**
 * Accept or reject cookies.
 */
export function setCookiesTracking(enabled: boolean) {
    cookies.set(GRANTED_COOKIE, enabled ? 'yes' : 'no');
}

/**
 * Return true if cookies are accepted or not.
 * Return `undefined` if state is not known.
 */
export function isCookiesTrackingDisabled() {
    const state = cookies.get(GRANTED_COOKIE);

    if (state === 'yes') {
        return false;
    } else if (state === 'no') {
        return true;
    }

    return undefined;
}

/**
 * Get a proposed visitor ID.
 */
function getNewVisitorId(): string {
    return `${crypto.randomUUID()}R`;
}
