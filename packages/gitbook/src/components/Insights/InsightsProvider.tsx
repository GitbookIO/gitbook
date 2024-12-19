'use client';

import * as React from 'react';
import type * as api from '@gitbook/api';

type SiteEventName = api.SiteInsightsEvent['type'];

type TrackEventInput<EventName extends SiteEventName> = { type: EventName } & Omit<Extract<api.SiteInsightsEvent, { type: EventName}>, 'location' | 'session'>;

type TrackEventCallback = <EventName extends SiteEventName>(event: TrackEventInput<EventName>) => void;

const InsightsContext = React.createContext<TrackEventCallback | null>(null);

/**
 * Wrap the content of the app with the InsightsProvider to track events.
 */
export function InsightsProvider(props: React.PropsWithChildren<{
    organizationId: string;
    siteId: string;
    siteSectionId: string | undefined;
    siteSpaceId: string | undefined;
    spaceId: string;
    siteShareKey: string | undefined;
}>) {
    const trackEvent = React.useCallback((event: TrackEventInput<SiteEventName>) => {
        console.log('trackEvent', event);
    }, []);

    return <InsightsContext.Provider value={trackEvent}>{props.children}</InsightsContext.Provider>;
}

/**
 * Get a callback to track an event.
 */
export function useTrackEvent(): TrackEventCallback {
    const trackEvent = React.useContext(InsightsContext);
    if (!trackEvent) {
        throw new Error('useTrackEvent must be used within an InsightsProvider');
    }

    return trackEvent;
}
