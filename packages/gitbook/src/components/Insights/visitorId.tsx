'use client';

import { createStore, useStore } from 'zustand';

import { getBrowserCookie } from '@/lib/browser';

import type { MaybePromise } from 'p-map';
import React from 'react';
import { isCookiesTrackingDisabled } from './cookies';
import { generateRandomId } from './utils';

const VISITORID_COOKIE = '__session';

/**
 * Visitor state when the visitor is not a signed-in GitBook user.
 */
type AnyVisitorResponse = {
    /**
     * A random identifier for the visitor. Resets if the user clears their cookies.
     */
    deviceId: string;
    userId?: undefined;
    organizationId?: undefined;
};

/**
 * Visitor state when the visitor is also a signed-in GitBook user.
 */
type VisitorUserResponse = AnyVisitorResponse & {
    userId: string;
    organizationId: string;
};

export type VisitorResponse = AnyVisitorResponse | VisitorUserResponse;

const visitorStore = createStore<{
    visitor: VisitorResponse | null;
    pendingVisitor: Promise<VisitorResponse> | null;
}>(() => ({
    visitor: null,
    pendingVisitor: null,
}));

/**
 * Fetch, synchronize the visitor with GitBook.
 */
export function VisitorProvider(
    props: React.PropsWithChildren<{
        appURL: string;
        visitorCookieTrackingEnabled: boolean;
    }>
) {
    const { appURL, visitorCookieTrackingEnabled, children } = props;

    React.useEffect(() => {
        const state = visitorStore.getState();
        if (state.pendingVisitor || state.visitor) {
            return;
        }

        const pendingVisitor = fetchGlobalVisitor({ appURL, visitorCookieTrackingEnabled });
        visitorStore.setState({ pendingVisitor, visitor: null });
        pendingVisitor.then((visitor) => {
            visitorStore.setState({ pendingVisitor: null, visitor });
        });
    }, [appURL, visitorCookieTrackingEnabled]);

    return <>{children}</>;
}

/**
 * Hook to get the current visitor session.
 */
export function useVisitor() {
    return useStore(visitorStore, (state) => state.visitor);
}

/**
 * Get the current visitor ID.
 */
export function getVisitor(): MaybePromise<VisitorResponse> {
    const state = visitorStore.getState();
    if (state.visitor) {
        return state.visitor;
    }
    if (state.pendingVisitor) {
        return state.pendingVisitor;
    }

    return {
        deviceId: getProposedVisitorId(),
    };
}

/**
 * Propose a visitor identifier to the GitBook.com server and get the devideId back.
 */
async function fetchGlobalVisitor({
    appURL,
    visitorCookieTrackingEnabled,
}: {
    appURL: string;
    visitorCookieTrackingEnabled: boolean;
}): Promise<VisitorResponse> {
    const withoutCookies = isCookiesTrackingDisabled();

    if (withoutCookies || !visitorCookieTrackingEnabled) {
        return {
            deviceId: getProposedVisitorId(),
        };
    }

    const { existing, proposedId } = getVisitorFromCookies();

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

        const visitor = (await resp.json()) as VisitorResponse;
        return visitor;
    } catch (error) {
        console.error('Failed to fetch visitor session ID', error);
        return {
            deviceId: proposedId,
        };
    }
}

/**
 * Extract the current visitor from the cookies.
 */
function getVisitorFromCookies(): { existing: VisitorResponse | null; proposedId: string } {
    const proposedId = getProposedVisitorId();
    const value = getBrowserCookie(VISITORID_COOKIE);
    if (!(value && typeof value === 'string')) {
        return { existing: null, proposedId };
    }

    try {
        const parsed = JSON.parse(value) as VisitorResponse;
        return { existing: parsed, proposedId };
    } catch {
        // Ignore legacy __session cookie format
        // and we'll renew it with the server using the previous one as a proposed ID
        return { existing: null, proposedId };
    }
}

let proposedIdCache: string | null = null;
function getProposedVisitorId(): string {
    proposedIdCache ??= generateRandomId();
    return proposedIdCache;
}
