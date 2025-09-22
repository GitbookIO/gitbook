'use client';

import type * as api from '@gitbook/api';
import { OpenAPIOperationContextProvider } from '@gitbook/react-openapi';
import * as React from 'react';
import { useDebounceCallback, useEventCallback } from 'usehooks-ts';

import { getAllBrowserCookiesMap } from '@/lib/browser';
import { type CurrentContentContext, useCurrentContent } from '../hooks';
import { getSession } from './sessions';
import { type SessionResponse, useVisitorSession } from './visitorId';

export type InsightsEventName = api.SiteInsightsEvent['type'];

/**
 * Context for an event on a page.
 */
export interface InsightsEventPageContext {
    displayContext: api.SiteInsightsDisplayContext;
    pageId: string | null;
}

/**
 * Options when tracking an event.
 */
interface InsightsEventOptions {
    /**
     * If true, the event will be sent immediately.
     * Passes true for events that could cause a page unload.
     */
    immediate?: boolean;
}

/**
 * Input data for an event.
 */
export type TrackEventInput<EventName extends InsightsEventName = InsightsEventName> = {
    type: EventName;
} & Omit<Extract<api.SiteInsightsEvent, { type: EventName }>, 'location' | 'session'>;

/**
 * Callback to track an event.
 */
type TrackEventCallback = <EventName extends InsightsEventName>(
    event: TrackEventInput<EventName>,
    ctx?: InsightsEventPageContext,
    options?: InsightsEventOptions
) => void;

const InsightsContext = React.createContext<TrackEventCallback>(() => {
    console.error('useTrackEvent must be used within an InsightsProvider');
});

interface InsightsProviderProps {
    /** If true, the events will be sent to the server. */
    enabled: boolean;

    /** The url of the endpoint to send events to */
    eventUrl: string;

    /** The children of the provider. */
    children: React.ReactNode;
}

/**
 * Wrap the content of the app with the InsightsProvider to track events.
 */
export function InsightsProvider(props: InsightsProviderProps) {
    const { enabled, children, eventUrl } = props;

    const visitorSession = useVisitorSession();
    const currentContent = useCurrentContent();
    const eventsRef = React.useRef<{
        [pathname: string]:
            | {
                  url: string;
                  events: TrackEventInput<InsightsEventName>[];
                  context: CurrentContentContext;
                  pageContext?: InsightsEventPageContext;
              }
            | undefined;
    }>({});

    /**
     * Synchronously flush all the pending events.
     */
    const flushEventsSync = useEventCallback(() => {
        const session = getSession();
        if (!visitorSession) {
            return;
        }

        const allEvents: api.SiteInsightsEvent[] = [];

        for (const pathname in eventsRef.current) {
            const eventsForPathname = eventsRef.current[pathname];
            if (!eventsForPathname || !eventsForPathname.events.length) {
                continue;
            }
            if (!eventsForPathname.pageContext) {
                continue;
            }

            allEvents.push(
                ...transformEvents({
                    url: eventsForPathname.url,
                    events: eventsForPathname.events,
                    context: currentContent,
                    pageContext: eventsForPathname.pageContext,
                    visitorSession,
                    sessionId: session.id,
                })
            );

            // Reset the events for the next flush
            eventsRef.current[pathname] = {
                ...eventsForPathname,
                events: [],
            };
        }

        if (allEvents.length > 0 && enabled) {
            sendEvents({
                eventUrl,
                events: allEvents,
            });
        }
    });

    const flushBatchedEvents = useDebounceCallback(() => {
        flushEventsSync();
    }, 1500);

    // Flush pending events once the visitor session has been fetched
    React.useEffect(() => {
        if (visitorSession) {
            flushEventsSync();
        }
    }, [visitorSession, flushEventsSync]);

    const trackEvent: TrackEventCallback = useEventCallback(
        (
            event: TrackEventInput<InsightsEventName>,
            ctx?: InsightsEventPageContext,
            options?: InsightsEventOptions
        ) => {
            const pathname = window.location.pathname;
            const previous = eventsRef.current[pathname];
            eventsRef.current[pathname] = {
                pageContext: previous?.pageContext ?? ctx,
                url: previous?.url ?? window.location.href,
                events: [
                    ...(previous?.events ?? []),
                    {
                        ...event,
                        timestamp: new Date().toISOString(),
                    },
                ],
                context: currentContent,
            };

            if (eventsRef.current[pathname].pageContext !== undefined) {
                // If the pageId is set, we know that the page_view event has been tracked
                // and we can flush the events
                if (options?.immediate) {
                    flushBatchedEvents.cancel();
                    flushEventsSync();
                } else {
                    flushBatchedEvents();
                }
            }
        }
    );

    /**
     * When the page is unloaded, flush all events.
     */
    React.useEffect(() => {
        window.addEventListener('beforeunload', flushEventsSync);
        return () => {
            window.removeEventListener('beforeunload', flushEventsSync);
        };
    }, [flushEventsSync]);

    return (
        <InsightsContext.Provider value={trackEvent}>
            <OpenAPIOperationContextProvider
                onOpenClient={(operation) => {
                    trackEvent({ type: 'api_client_open', operation });
                }}
            >
                {children}
            </OpenAPIOperationContextProvider>
        </InsightsContext.Provider>
    );
}

/**
 * Get a callback to track an event.
 */
export function useTrackEvent(): TrackEventCallback {
    return React.useContext(InsightsContext);
}

/**
 * Post the events to the server.
 */
function sendEvents(args: {
    eventUrl: string;
    events: api.SiteInsightsEvent[];
}) {
    const { eventUrl, events } = args;

    fetch(eventUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        keepalive: true,
        body: JSON.stringify({
            events,
        }),
    }).catch((error) => {
        // We don't want to throw when this fails.
        console.error('Error sending events', error);
    });
}

/**
 * Transform the events to the format expected by the API.
 */
function transformEvents(input: {
    url: string;
    events: TrackEventInput<InsightsEventName>[];
    context: CurrentContentContext;
    pageContext: InsightsEventPageContext;
    visitorSession: SessionResponse;
    sessionId: string;
}): api.SiteInsightsEvent[] {
    const session: api.SiteInsightsEventSession = {
        sessionId: input.sessionId,
        visitorId: input.visitorSession.deviceId,
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        cookies: getAllBrowserCookiesMap(),
        referrer: document.referrer || null,
        visitorAuthClaims: input.context.visitorAuthClaims,
    };

    const location: api.SiteInsightsEventLocation = {
        url: input.url,
        siteSection: input.context.siteSectionId ?? null,
        siteSpace: input.context.siteSpaceId ?? null,
        space: input.context.spaceId,
        siteShareKey: input.context.siteShareKey ?? null,
        revision: input.context.revisionId,
        page: input.pageContext.pageId,
        displayContext: input.pageContext.displayContext,
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
