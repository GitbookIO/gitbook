'use client';

import { createStore, useStore } from 'zustand';

import {
    getBrowserCookie,
    getLocalStorageItem,
    removeLocalStorageItem,
    setLocalStorageItem,
} from '@/lib/browser';

import type { MaybePromise } from 'p-map';
import React from 'react';
import { isCookiesTrackingDisabled } from './cookies';
import { generateRandomId } from './utils';

const VISITORID_COOKIE = '__session';
const VISITOR_UPDATED_AT_STORAGE_KEY = '__session_updated';

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
 * Time while a cookie is considered valid before revalidating it.
 */
const STALE_TIME_MS = 60 * 60 * 1000;

function getVisitorUpdatedAt(deviceId: string): number | null {
    const value = getLocalStorageItem<{ deviceId: string; updatedAt: number } | null>(
        VISITOR_UPDATED_AT_STORAGE_KEY,
        null
    );
    if (!value) {
        return null;
    }
    if (value.deviceId !== deviceId) {
        clearVisitorUpdatedAt();
        return null;
    }
    return value.updatedAt;
}

function clearVisitorUpdatedAt() {
    removeLocalStorageItem(VISITOR_UPDATED_AT_STORAGE_KEY);
}

function setVisitorUpdatedAt(deviceId: string, updatedAt: number) {
    setLocalStorageItem(VISITOR_UPDATED_AT_STORAGE_KEY, { deviceId, updatedAt });
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

function isSignedInVisitor(value: unknown): value is VisitorUserResponse {
    return Boolean(isVisitor(value) && value?.userId && value.organizationId);
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

    const fetchGlobalVisitor = async () => {
        const url = new URL(appURL);
        url.pathname = '/__session/2/';
        url.searchParams.set('proposed', proposedId);

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

            // When cookie tracking is disabled we still allow a signed-in session to be detected,
            // but otherwise we preserve the no-cookie behavior by returning an anonymous visitor.
            if (!isSignedInVisitor(visitor)) {
                clearVisitorUpdatedAt();
                return { deviceId: proposedId };
            }

            setVisitorUpdatedAt(visitor.deviceId, Date.now());

            return visitor;
        } catch (error) {
            clearVisitorUpdatedAt();
            console.error('Failed to fetch visitor session ID', error);
            if (existing) {
                return existing;
            }
            return { deviceId: proposedId };
        }
    };

    const { existing, proposedId } = getVisitorFromCookies();

    if (existing) {
        // Revalidate in background if stale.
        const updatedAt = getVisitorUpdatedAt(existing.deviceId);
        const isStale = !updatedAt || updatedAt < Date.now() - STALE_TIME_MS;
        return { visitor: existing, pendingVisitor: isStale ? fetchGlobalVisitor() : null };
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
