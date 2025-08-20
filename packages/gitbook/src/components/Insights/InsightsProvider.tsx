'use client';

import type * as api from '@gitbook/api';
import { OpenAPIOperationContextProvider } from '@gitbook/react-openapi';
import * as React from 'react';
import { useDebounceCallback, useEventCallback } from 'usehooks-ts';

import { getAllBrowserCookiesMap } from '@/lib/browser';
import { type CurrentContentContext, useCurrentContent } from '../hooks';
import { getSession } from './sessions';
import { getVisitorId } from './visitorId';

export type InsightsEventName = api.SiteInsightsEvent['type'];

/**
 * Context for an event on a page.
 */
export interface InsightsEventPageContext {
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

const InsightsContext = React.createContext<TrackEventCallback>(() => {});

interface InsightsProviderProps {
    /** If true, the events will be sent to the server. */
    enabled: boolean;

    /** If true, the visitor cookie tracking will be used */
    visitorCookieTrackingEnabled: boolean;

    /** The application URL. */
    appURL: string;

    /** The base path of the site. */
    basePath: string;

    /** The children of the provider. */
    children: React.ReactNode;
}

/**
 * Wrap the content of the app with the InsightsProvider to track events.
 */
export function InsightsProvider(props: InsightsProviderProps) {
    const { enabled, children, visitorCookieTrackingEnabled, basePath, appURL } = props;

    const currentContent = useCurrentContent();
    const visitorIdRef = React.useRef<string | null>(null);
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
        const visitorId = visitorIdRef.current;
        if (!visitorId) {
            throw new Error('Visitor ID should be set before flushing events');
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
                    visitorId,
                    sessionId: session.id,
                })
            );

            // Reset the events for the next flush
            eventsRef.current[pathname] = {
                ...eventsForPathname,
                events: [],
            };
        }

        if (allEvents.length > 0) {
            if (enabled) {
                sendEvents({
                    basePath,
                    organizationId: currentContent.organizationId,
                    siteId: currentContent.siteId,
                    events: allEvents,
                });
            } else {
            }
        }
    });

    const flushBatchedEvents = useDebounceCallback(async () => {
        const visitorId =
            visitorIdRef.current ?? (await getVisitorId(appURL, visitorCookieTrackingEnabled));
        visitorIdRef.current = visitorId;

        flushEventsSync();
    }, 1500);

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
                if (options?.immediate && visitorIdRef.current) {
                    flushBatchedEvents.cancel();
                    flushEventsSync();
                } else {
                    flushBatchedEvents();
                }
            }
        }
    );

    /**
     * Get the visitor ID and store it in a ref.
     */
    React.useEffect(() => {
        getVisitorId(appURL, visitorCookieTrackingEnabled).then((visitorId) => {
            visitorIdRef.current = visitorId;
            // When the page is unloaded, flush all events, but only if the visitor ID is set
            window.addEventListener('beforeunload', flushEventsSync);
        });
        return () => {
            window.removeEventListener('beforeunload', flushEventsSync);
        };
    }, [flushEventsSync, visitorCookieTrackingEnabled, appURL]);

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
    basePath: string;
    organizationId: string;
    siteId: string;
    events: api.SiteInsightsEvent[];
}) {
    const { basePath, organizationId, siteId, events } = args;
    const url = new URL(window.location.href);
    url.pathname = `${basePath}/~gitbook/__evt`;
    url.searchParams.set('o', organizationId);
    url.searchParams.set('s', siteId);

    fetch(url.toString(), {
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
    visitorId: string;
    sessionId: string;
}): api.SiteInsightsEvent[] {
    const session: api.SiteInsightsEventSession = {
        sessionId: input.sessionId,
        visitorId: input.visitorId,
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
