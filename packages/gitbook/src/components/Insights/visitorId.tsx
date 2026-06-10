'use client';

import type { SiteInsightsSession } from '@gitbook/api';
import type { MaybePromise } from 'p-map';
import React from 'react';
import { createStore, useStore } from 'zustand';

import { getBrowserCookie, getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';

import { isCookiesTrackingDisabled } from './cookies';
import { getSession } from './sessions';
import { generateRandomId } from './utils';

const VISITORID_COOKIE = '__session';
const VISITOR_STORAGE_KEY = '__session_updated';

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
type VisitorUserResponse = Pick<AnyVisitorResponse, 'deviceId'> & {
    userId: string;
    organizationId: string;
};

/**
 * Time while a stored visitor is considered valid before revalidating it.
 */
const STALE_TIME_MS = 60 * 60 * 1000;

interface StoredVisitor {
    visitor: VisitorResponse;
    updatedAt: number;
}

function getStoredVisitor(): StoredVisitor | null {
    const value = getLocalStorageItem<StoredVisitor | null>(VISITOR_STORAGE_KEY, null);
    if (value && isVisitor(value.visitor) && typeof value.updatedAt === 'number') {
        return value;
    }
    return null;
}

function setStoredVisitor(visitor: VisitorResponse, updatedAt: number) {
    setLocalStorageItem(VISITOR_STORAGE_KEY, { visitor, updatedAt });
}

export type VisitorResponse = AnyVisitorResponse | VisitorUserResponse;

function isVisitor(value: unknown): value is VisitorResponse {
    return Boolean(
        value &&
            typeof value === 'object' &&
            'deviceId' in value &&
            typeof value.deviceId === 'string' &&
            value.deviceId
    );
}

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
        const result = getGlobalVisitor({ appURL, visitorCookieTrackingEnabled });
        visitorStore.setState(result);

        if (result.pendingVisitor) {
            result.pendingVisitor
                .then((visitor) => {
                    visitorStore.setState({ pendingVisitor: null, visitor });
                })
                .catch(() => {
                    // Preserve any existing visitor state; only clear the pending flag on failure.
                    visitorStore.setState({ pendingVisitor: null });
                });
        }
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
 * Get the visitor session for insights.
 */
export async function getInsightsSession(): Promise<SiteInsightsSession> {
    return {
        sessionId: getSession().id,
        visitorId: (await getVisitor()).deviceId,
    };
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
 * Propose a visitor identifier to the GitBook.com server and get the deviceId back.
 */
function getGlobalVisitor({
    appURL,
    visitorCookieTrackingEnabled,
}: {
    appURL: string;
    visitorCookieTrackingEnabled: boolean;
}): {
    visitor: VisitorResponse | null;
    pendingVisitor: Promise<VisitorResponse> | null;
} {
    const withoutCookies = isCookiesTrackingDisabled();

    if (withoutCookies || !visitorCookieTrackingEnabled) {
        return { visitor: { deviceId: getProposedVisitorId() }, pendingVisitor: null };
    }

    const { existing, proposedId } = getVisitorFromCookies();
    const stored = getStoredVisitor();

    // Cookie wins, localStorage survives third-party cookie blocking, proposed id is the fallback
    const stableId = existing?.deviceId ?? stored?.visitor.deviceId ?? proposedId;

    const fetchGlobalVisitor = async () => {
        const url = new URL(appURL);
        url.pathname = '/__session/2/';
        url.searchParams.set('proposed', stableId);

        try {
            const resp = await fetch(url, {
                method: 'GET', // Use GET to play nicely with SameSite cookies.
                credentials: 'include', // Make sure to send/receive cookies.
                cache: 'no-cache',
                mode: 'cors', // Need to use cors as we are on a different domain.
                signal: AbortSignal.timeout(500),
            });

            if (!resp.ok) {
                throw new Error(`Unexpected __session response: ${resp.status}`);
            }

            const visitor = await resp.json();

            if (!isVisitor(visitor)) {
                throw new Error(`Unexpected __session format: ${JSON.stringify(visitor)}`);
            }

            setStoredVisitor(visitor, Date.now());

            return visitor;
        } catch (error) {
            console.error('Failed to fetch visitor session ID', error);
            return existing ?? stored?.visitor ?? { deviceId: stableId };
        }
    };

    // Return immediately if we already have a visitor, revalidate in the background only when stale
    const immediate = existing ?? stored?.visitor ?? null;
    if (immediate) {
        const isStale = !stored || stored.updatedAt < Date.now() - STALE_TIME_MS;
        return {
            visitor: immediate,
            pendingVisitor: isStale ? fetchGlobalVisitor() : null,
        };
    }

    return { visitor: null, pendingVisitor: fetchGlobalVisitor() };
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
