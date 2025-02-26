'use client';

import * as cookies from '@/lib/cookies';

import { isCookiesTrackingDisabled } from './cookies';
import { generateRandomId } from './utils';

const VISITORID_COOKIE = '__session';

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
        return generateRandomId();
    }

    const existingTrackingCookie = cookies.get(VISITORID_COOKIE);

    if (existingTrackingCookie) {
        // If the cookie already exists, we'll just use that. Avoids a server request.
        return existingTrackingCookie;
    }
    // No tracking deviceId set, we'll need to consolidate with the server.
    const proposed = generateRandomId();

    const url = new URL(process.env.NEXT_PUBLIC_GITBOOK_APP_URL ?? 'https://app.gitbook.com');
    url.pathname = '/__session';
    url.searchParams.set('proposed', proposed);

    try {
        const resp = await fetch(url, {
            method: 'GET', // Use GET to play nicely with SameSite cookies.
            credentials: 'include', // Make sure to send/receive cookies.
            cache: 'no-cache',
            mode: 'cors', // Need to use cors as we are on a different domain.
        });

        const { deviceId } = (await resp.json()) as { deviceId: string };
        return deviceId;
    } catch (error) {
        console.error('Failed to fetch visitor session ID', error);
        return proposed;
    }
}
