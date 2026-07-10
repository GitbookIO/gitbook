'use client';

import type { ContentKitWebFrame } from '@gitbook/api';
import React from 'react';

import { Icon } from '@gitbook/icons';
import { type ContentKitClientContextData, useContentKitClientContext } from './context';
import { resolveDynamicBinding } from './dynamic';
import type { ContentKitClientElementProps } from './types';

const MIN_HEIGHT = 32; // minimum height for the iframe in pixels

export function ElementWebframe(props: ContentKitClientElementProps<ContentKitWebFrame>) {
    const { element } = props;

    const [mounted, setMounted] = React.useState(false);
    const renderer = useContentKitClientContext();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [size, setSize] = React.useState<{
        height?: number;
        aspectRatio?: number;
    }>({});

    const readyRef = React.useRef(false);
    const messagesQueueRef = React.useRef<object[]>([]);

    const sendMessage = React.useCallback(
        (message: object) => {
            const target = new URL(element.source.url);

            // For security reasons, only iframe from our integrations domains are allowed
            // to send and receive messages
            if (!renderer.security.firstPartyDomains.includes(target.host)) {
                return;
            }

            if (readyRef.current) {
                if (!iframeRef.current) {
                    return;
                }

                iframeRef.current.contentWindow?.postMessage(
                    message,
                    `${target.protocol}//${target.host}`
                );
            } else {
                messagesQueueRef.current.push(message);
            }
        },
        [element.source.url, renderer.security]
    );

    // Listen to messages coming from the webframe
    React.useEffect(() => {
        const callback = (event: MessageEvent) => {
            if (!iframeRef.current) {
                return;
            }

            const message = event.data;

            if (!URL.canParse(event.origin)) {
                return;
            }

            const origin = new URL(event.origin);

            // For security reasons, only iframe from our integrations domains are allowed
            // to send and receive messages
            if (!renderer.security.firstPartyDomains.includes(origin.host)) {
                return;
            }

            const contentWindow = iframeRef.current.contentWindow;

            // Discard any messages coming other potential webframes on the page.
            if (!contentWindow || event.source !== contentWindow) {
                return;
            }

            if (typeof message === 'string') {
                try {
                    // We support the default oembed iframe protocol
                    // https://docs.embed.ly/reference/provider-height-resizing
                    const parsed = JSON.parse(message);
                    if (parsed.context === 'iframe.resize' && typeof parsed.height === 'number') {
                        const width = iframeRef.current.clientWidth;
                        const height = parsed.height;

                        setSize({
                            aspectRatio: width / height,
                            height: height,
                        });
                    }
                } catch (_err) {
                    return;
                }
            }

            if (message.action) {
                switch (message.action.action) {
                    case '@webframe.ready':
                        readyRef.current = true;
                        messagesQueueRef.current.forEach((message) => {
                            sendMessage(message);
                        });
                        messagesQueueRef.current = [];
                        break;
                    case '@webframe.resize':
                        setSize((size) => ({
                            aspectRatio:
                                typeof message.action.size.aspectRatio !== 'undefined'
                                    ? Number(message.action.size.aspectRatio)
                                    : size.aspectRatio,

                            height: (() => {
                                if (typeof message.action.size.height !== 'undefined') {
                                    return Number(message.action.size.height);
                                }

                                // maxHeight was used prior to moving to height, maintain it for backward compatibility.
                                if (typeof message.action.size.maxHeight !== 'undefined') {
                                    return Number(message.action.size.maxHeight);
                                }

                                return size.height;
                            })(),
                        }));
                        break;
                    case '@webframe.navigate': {
                        // Let the host navigate to another page. The destination is addressed by
                        // `pageId` (preferred, resolved against the site's page tree) or `path`;
                        // the host resolves it within the current site and gates the destination.
                        const anchor =
                            typeof message.action.anchor === 'string'
                                ? message.action.anchor
                                : undefined;
                        if (typeof message.action.pageId === 'string') {
                            renderer.clientContext?.navigate?.({
                                pageId: message.action.pageId,
                                anchor,
                            });
                        } else if (typeof message.action.path === 'string') {
                            renderer.clientContext?.navigate?.({
                                path: message.action.path,
                                anchor,
                            });
                        }
                        break;
                    }
                    default:
                        renderer.update({
                            action: message.action,
                        });
                }
            }
        };

        window.addEventListener('message', callback);

        // We only render the iframe once we have added the event listener
        // otherwise during SSR, we'll miss messages
        setMounted(true);

        return () => {
            window.removeEventListener('message', callback);
        };
    }, [renderer, sendMessage]);

    // Send data and client-only context (visitor claims, current page) as state to the webframe.
    React.useEffect(() => {
        const abort = { cancelled: false };
        sendWebframeState({
            elementData: element.data,
            rendererState: renderer.state,
            clientContext: renderer.clientContext,
            sendMessage,
            abort,
        });

        return () => {
            abort.cancelled = true;
        };
    }, [element.data, renderer.state, renderer.clientContext, sendMessage]);

    const height = size.height ? Math.max(size.height, MIN_HEIGHT) : undefined;

    const aspectRatio =
        size.aspectRatio ||
        element.aspectRatio ||
        (iframeRef.current?.clientWidth && height
            ? iframeRef.current.clientWidth / height
            : undefined);

    if (!mounted) {
        return <Icon icon="spinner" className="contentkit-button-loading" style={{ height }} />;
    }

    // only use height measurement if no aspect ratio is defined
    const useHeightMeasurement = !aspectRatio && height;

    return (
        <iframe
            ref={iframeRef}
            src={element.source.url}
            title={element.source.url}
            allowFullScreen
            allow="clipboard-write"
            className="contentkit-webframe h-full w-full max-w-full border-none"
            style={{
                aspectRatio,
                height: useHeightMeasurement ? height : undefined,
                maxHeight: height,
            }}
        />
    );
}

type WebframeState = Record<string, unknown>;

/**
 * Resolve configured webframe data bindings against the current ContentKit state.
 */
function resolveWebframeState(
    elementData: ContentKitWebFrame['data'],
    rendererState: object
): WebframeState {
    const state: WebframeState = {};

    if (!elementData) {
        return state;
    }

    Object.entries(elementData).forEach(([key, value]) => {
        state[key] = resolveDynamicBinding(rendererState, value);
    });

    return state;
}

/**
 * Resolve the optional client-only contexts (visitor claims, current page)
 * to merge into the webframe state.
 */
async function resolveClientContexts(clientContext: ContentKitClientContextData | undefined) {
    return await Promise.all([
        clientContext?.getVisitorContext?.(),
        clientContext?.getPageContext?.(),
    ]);
}

/**
 * Send the combined webframe state once client-only contexts have been resolved.
 */
async function sendWebframeState(args: {
    elementData: ContentKitWebFrame['data'];
    rendererState: object;
    clientContext: ContentKitClientContextData | undefined;
    sendMessage: (message: object) => void;
    abort: { cancelled: boolean };
}) {
    const { elementData, rendererState, clientContext, sendMessage, abort } = args;
    const state = resolveWebframeState(elementData, rendererState);
    const clientContexts = await resolveClientContexts(clientContext);

    if (abort.cancelled) {
        return;
    }

    for (const context of clientContexts) {
        if (context) {
            Object.assign(state, context);
        }
    }

    if (Object.keys(state).length > 0) {
        sendMessage({ state });
    }
}
