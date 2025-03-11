'use client';

import type { ContentKitWebFrame } from '@gitbook/api';
import React from 'react';

import { useContentKitClientContext } from './context';
import { resolveDynamicBinding } from './dynamic';
import type { ContentKitClientElementProps } from './types';

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
        [renderer.security]
    );

    //
    // Listen to message coming from the webframe
    //
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
                        const width = contentWindow.outerWidth;
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

    //
    // Send data to the webframe
    //
    React.useEffect(() => {
        if (!element.data) {
            return;
        }

        const state: Record<string, string> = {};
        Object.entries(element.data).forEach(([key, value]) => {
            state[key] = resolveDynamicBinding(renderer.state, value);
        });

        return sendMessage({ state });
    }, [element.data, renderer.state, sendMessage]);

    if (!mounted) {
        return null;
    }

    const aspectRatio = size.aspectRatio || element.aspectRatio;

    return (
        <iframe
            ref={iframeRef}
            src={element.source.url}
            title={element.source.url}
            allowFullScreen
            allow="clipboard-write"
            className="contentkit-webframe"
            style={{
                // If given an aspect ratio, use width as auto dimension and let height take precedence.
                ...(aspectRatio
                    ? {
                          width: 'auto',
                          aspectRatio,
                      }
                    : { width: '100%' }),

                maxWidth: '100%',
                height: Math.max(size.height || 0, 32),
                border: 'none',
            }}
        />
    );
}
