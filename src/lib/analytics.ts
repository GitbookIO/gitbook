'use client';

import cookies from 'js-cookie';

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
    const existingTrackingCookie = cookies.get(VISITORID_COOKIE);

    if (existingTrackingCookie) {
        // If the cookie already exists, we'll just use that. Avoids a server request.
        return existingTrackingCookie;
    } else {
        // No tracking deviceId set, we'll need to consolidate with the server.
        const proposed = `${crypto.randomUUID()}R`;

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
