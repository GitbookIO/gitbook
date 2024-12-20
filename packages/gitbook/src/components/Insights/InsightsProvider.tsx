'use client';

import type * as api from '@gitbook/api';
import cookies from 'js-cookie';
import * as React from 'react';
import { useEventCallback, useDebounceCallback } from 'usehooks-ts';

import { getSession } from './sessions';
import { getVisitorId } from './visitorId';

interface InsightsEventContext {
    organizationId: string;
    siteId: string;
    siteSectionId: string | undefined;
    siteSpaceId: string | undefined;
    spaceId: string;
    siteShareKey: string | undefined;
}

interface InsightsEventPageContext {
    pageId: string | null;
    revisionId: string;
}

type SiteEventName = api.SiteInsightsEvent['type'];

type TrackEventInput<EventName extends SiteEventName> = { type: EventName } & Omit<
    Extract<api.SiteInsightsEvent, { type: EventName }>,
    'location' | 'session'
>;

type TrackEventCallback = <EventName extends SiteEventName>(
    event: TrackEventInput<EventName>,
    ctx?: InsightsEventPageContext,
) => void;

const InsightsContext = React.createContext<TrackEventCallback | null>(null);

interface InsightsProviderProps extends InsightsEventContext {
    enabled: boolean;
    apiHost: string;
    children: React.ReactNode;
}

/**
 * Wrap the content of the app with the InsightsProvider to track events.
 */
export function InsightsProvider(props: InsightsProviderProps) {
    const { enabled, apiHost, children, ...context } = props;

    const eventsRef = React.useRef<{
        [pathname: string]:
            | {
                  url: string;
                  events: TrackEventInput<SiteEventName>[];
                  context: InsightsEventContext;
                  pageContext?: InsightsEventPageContext;
              }
            | undefined;
    }>({});

    const flushEvents = useDebounceCallback(async (pathname: string) => {
        const visitorId = await getVisitorId();
        const session = await getSession();

        const eventsForPathname = eventsRef.current[pathname];
        if (!eventsForPathname || !eventsForPathname.pageContext) {
            console.warn('No events to flush', eventsForPathname);
            return;
        }

        const events = transformEvents({
            url: eventsForPathname.url,
            events: eventsForPathname.events,
            context,
            pageContext: eventsForPathname.pageContext,
            visitorId,
            sessionId: session.id,
        });

        // Reset the events for the next flush
        eventsRef.current[pathname] = {
            ...eventsForPathname,
            events: [],
        };

        if (enabled) {
            console.log('Sending events', events);
            await sendEvents({
                apiHost,
                organizationId: context.organizationId,
                siteId: context.siteId,
                events,
            });
        } else {
            console.log('Events not sent', events);
        }
    }, 500);

    const trackEvent = useEventCallback(
        (event: TrackEventInput<SiteEventName>, ctx?: InsightsEventPageContext) => {
            console.log('Logging event', event, ctx);

            const pathname = window.location.pathname;
            const previous = eventsRef.current[pathname];
            eventsRef.current[pathname] = {
                pageContext: previous?.pageContext ?? ctx,
                url: previous?.url ?? window.location.href,
                events: [...(previous?.events ?? []), event],
                context,
            };

            if (eventsRef.current[pathname].pageContext !== undefined) {
                // If the pageId is set, we know that the page_view event has been tracked
                // and we can flush the events
                flushEvents(pathname);
            }
        },
    );

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

/**
 * Post the events to the server.
 */
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
            events,
        }),
    });
}

/**
 * Transform the events to the format expected by the API.
 */
function transformEvents(input: {
    url: string;
    events: TrackEventInput<SiteEventName>[];
    context: InsightsEventContext;
    pageContext: InsightsEventPageContext;
    visitorId: string;
    sessionId: string;
}): api.SiteInsightsEvent[] {
    const session: api.SiteInsightsEventSession = {
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        cookies: cookies.get(),
        referrer: document.referrer || null,
    };

    const location: api.SiteInsightsEventLocation = {
        url: input.url,
        siteSection: input.context.siteSectionId ?? null,
        siteSpace: input.context.siteSpaceId ?? null,
        space: input.context.spaceId,
        siteShareKey: input.context.siteShareKey ?? null,
        page: input.pageContext.pageId,
        revision: input.pageContext.revisionId,
    };

    return input.events.map((partialEvent) => {
        // @ts-expect-error: Partial event
        const event: api.SiteInsightsEvent = {
            ...partialEvent,
            session,
            location,
        };

        return event;
    });
}
