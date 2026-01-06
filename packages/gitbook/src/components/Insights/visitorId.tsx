'use client';

import { createStore, useStore } from 'zustand';

import { getBrowserCookie } from '@/lib/browser';

import React from 'react';
import { isCookiesTrackingDisabled } from './cookies';
import { generateRandomId } from './utils';

const VISITORID_COOKIE = '__session';

type SessionVisitorResponse = {
    deviceId: string;
    userId?: undefined;
    organizationId?: undefined;
};

type SessionUserResponse = SessionVisitorResponse & {
    userId: string;
    organizationId: string;
};

export type SessionResponse = SessionVisitorResponse | SessionUserResponse;

const visitorSessionStore = createStore<{
    session: SessionResponse | null;
    pendingSession: Promise<SessionResponse> | null;
}>(() => ({
    session: null,
    pendingSession: null,
}));

/**
 * Fetch, synchronize the visitor sesion with GitBook.
 */
export function VisitorSessionProvider(
    props: React.PropsWithChildren<{
        appURL: string;
        visitorCookieTrackingEnabled: boolean;
    }>
) {
    const { appURL, visitorCookieTrackingEnabled, children } = props;

    React.useEffect(() => {
        const state = visitorSessionStore.getState();
        if (state.pendingSession || state.session) {
            return;
        }

        const pendingSession = fetchSession({ appURL, visitorCookieTrackingEnabled });
        visitorSessionStore.setState({ pendingSession, session: null });
        pendingSession.then((session) => {
            visitorSessionStore.setState({ pendingSession: null, session });
        });
    }, [appURL, visitorCookieTrackingEnabled]);

    return <>{children}</>;
}

/**
 * Hook to get the current visitor session.
 */
export function useVisitorSession() {
    return useStore(visitorSessionStore, (state) => state.session);
}

/**
 * Propose a visitor identifier to the GitBook.com server and get the devideId back.
 */
async function fetchSession({
    appURL,
    visitorCookieTrackingEnabled,
}: {
    appURL: string;
    visitorCookieTrackingEnabled: boolean;
}): Promise<SessionResponse> {
    const withoutCookies = isCookiesTrackingDisabled();

    if (withoutCookies || !visitorCookieTrackingEnabled) {
        return {
            deviceId: generateRandomId(),
        };
    }

    const { existing, proposedId } = getSessionCookie();

    if (existing) {
        // If the cookie already exists, we'll just use that. Avoids a server request.
        return existing;
    }

    const url = new URL(appURL);
    url.pathname = '/__session/2/';
    url.searchParams.set('proposed', proposedId);

    try {
        const resp = await fetch(url, {
            method: 'GET', // Use GET to play nicely with SameSite cookies.
            credentials: 'include', // Make sure to send/receive cookies.
            cache: 'no-cache',
            mode: 'cors', // Need to use cors as we are on a different domain.
        });

        const session = (await resp.json()) as SessionResponse;
        return session;
    } catch (error) {
        console.error('Failed to fetch visitor session ID', error);
        return {
            deviceId: proposedId,
        };
    }
}

function getSessionCookie(): { existing: SessionResponse | null; proposedId: string } {
    const proposed = generateRandomId();
    const value = getBrowserCookie(VISITORID_COOKIE);
    if (!(value && typeof value === 'string')) {
        return { existing: null, proposedId: proposed };
    }

    try {
        const parsed = JSON.parse(value) as SessionResponse;
        return { existing: parsed, proposedId: proposed };
    } catch {
        // Ignore legacy __session cookie format
        // and we'll renew it with the server using the previous one as a proposed ID
        return { existing: null, proposedId: proposed };
    }
}
