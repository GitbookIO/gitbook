'use client';

import type * as api from '@gitbook/api';
import { OpenAPIOperationContextProvider } from '@gitbook/react-openapi';
import cookies from 'js-cookie';
import * as React from 'react';
import { useEventCallback, useDebounceCallback } from 'usehooks-ts';

import { getSession } from './sessions';
import { getVisitorId } from './visitorId';

type SiteEventName = api.SiteInsightsEvent['type'];

/**
 * Global context for all events in the session.
 */
interface InsightsEventContext {
    organizationId: string;
    siteId: string;
    siteSectionId: string | undefined;
    siteSpaceId: string | undefined;
    spaceId: string;
    siteShareKey: string | undefined;
}

/**
 * Context for an event on a page.
 */
interface InsightsEventPageContext {
    pageId: string | null;
    revisionId: string;
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
type TrackEventInput<EventName extends SiteEventName> = { type: EventName } & Omit<
    Extract<api.SiteInsightsEvent, { type: EventName }>,
    'location' | 'session'
>;

/**
 * Callback to track an event.
 */
type TrackEventCallback = <EventName extends SiteEventName>(
    event: TrackEventInput<EventName>,
    ctx?: InsightsEventPageContext,
    options?: InsightsEventOptions,
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

    const visitorIdRef = React.useRef<string | null>(null);
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

    const flushEventsSync = useEventCallback((pathname: string) => {
        const visitorId = visitorIdRef.current;
        if (!visitorId) {
            throw new Error('Visitor ID not set');
        }
        const session = getSession();

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
            sendEvents({
                apiHost,
                organizationId: context.organizationId,
                siteId: context.siteId,
                events,
            });
        } else {
            console.log('Skipping sending events', events);
        }
    });

    const flushBatchedEvents = useDebounceCallback(async (pathname: string) => {
        const visitorId = visitorIdRef.current ?? (await getVisitorId());
        visitorIdRef.current = visitorId;

        flushEventsSync(pathname);
    }, 500);

    const trackEvent: TrackEventCallback = useEventCallback(
        (
            event: TrackEventInput<SiteEventName>,
            ctx?: InsightsEventPageContext,
            options?: InsightsEventOptions,
        ) => {
            console.log('Logging event', event, ctx);

            const pathname = window.location.pathname;
            const previous = eventsRef.current[pathname];
            eventsRef.current[pathname] = {
                pageContext: previous?.pageContext ?? ctx,
                url: previous?.url ?? window.location.href,
                events: [...(previous?.events ?? []), {
                    ...event,
                    timestamp: new Date().toISOString(),
                }],
                context,
            };

            if (eventsRef.current[pathname].pageContext !== undefined) {
                // If the pageId is set, we know that the page_view event has been tracked
                // and we can flush the events
                if (options?.immediate && visitorIdRef.current) {
                    flushEventsSync(pathname);
                } else {
                    flushBatchedEvents(pathname);
                }
            }
        },
    );

    const flushAllEvents = useEventCallback(() => {
        for (const pathname in eventsRef.current) {
            flushEventsSync(pathname);
        }
    });

    // When the page is unloaded, flush all events
    React.useEffect(() => {
        window.addEventListener('beforeunload', flushAllEvents);
        return () => {
            window.removeEventListener('beforeunload', flushAllEvents);
        };
    }, [flushAllEvents]);

    return (
        <InsightsContext.Provider value={trackEvent}>
            <OpenAPIOperationContextProvider
                onOpenClient={(operation) => {
                    trackEvent({ type: 'api_client_open', operation });
                }}
            >
                {props.children}
            </OpenAPIOperationContextProvider>
        </InsightsContext.Provider>
    );
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
function sendEvents(args: {
    apiHost: string;
    organizationId: string;
    siteId: string;
    events: api.SiteInsightsEvent[];
}) {
    const { apiHost, organizationId, siteId, events } = args;
    const url = new URL(apiHost);
    url.pathname = `/v1/orgs/${organizationId}/sites/${siteId}/insights/events`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        keepalive: true,
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
