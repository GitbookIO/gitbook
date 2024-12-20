'use client';

import * as React from 'react';
import { useEventCallback, useDebounceCallback } from 'usehooks-ts'
import type * as api from '@gitbook/api';
import { getVisitorId } from './visitorId';
import { getSession } from './sessions';

type SiteEventName = api.SiteInsightsEvent['type'];

type TrackEventInput<EventName extends SiteEventName> = { type: EventName } & Omit<Extract<api.SiteInsightsEvent, { type: EventName}>, 'location' | 'session'>;

type TrackEventCallback = <EventName extends SiteEventName>(event: TrackEventInput<EventName>) => void;

const InsightsContext = React.createContext<TrackEventCallback | null>(null);

/**
 * Wrap the content of the app with the InsightsProvider to track events.
 */
export function InsightsProvider(props: React.PropsWithChildren<{
    enabled: boolean;
    apiHost: string;
    organizationId: string;
    siteId: string;
    siteSectionId: string | undefined;
    siteSpaceId: string | undefined;
    spaceId: string;
    siteShareKey: string | undefined;
}>) {
    const eventsRef = React.useRef<TrackEventInput<SiteEventName>[]>([]);

    const flushEvents = useDebounceCallback(() => {
        const events = eventsRef.current;
        eventsRef.current = [];

        console.log('Flushing events', events);

        getVisitorId().then((visitorId) => {
            const session = getSession();

            console.log('Visitor ID', { visitorId, session });
        });
    }, 500);

    const trackEvent = useEventCallback((event: TrackEventInput<SiteEventName>) => {
        eventsRef.current.push(event);
        flushEvents();
    });

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



async function sendEvents(args: {
    apiHost: string;
    organizationId: string;
    siteId: string;
    events: api.SiteInsightsEvent[];
}) {
    const { apiHost, organizationId, siteId, events } = args;
    const url = new URL(apiHost);
    url.pathname = `/v1/orgs/${organizationId}/sites/${siteId}/insights/events`;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            events
        }),
    });
}
