'use client';

import { ContentKitWebFrame } from '@gitbook/api';
import React from 'react';

import { useContentKitClientContext } from './context';
import { ContentKitClientElementProps } from './types';
import { resolveDynamicBinding } from './dynamic';

export function ElementWebframe(props: ContentKitClientElementProps<ContentKitWebFrame>) {
    const { element } = props;

    const renderer = useContentKitClientContext();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [size, setSize] = React.useState<{
        maxWidth?: number;
        maxHeight?: number;
        aspectRatio?: number;
    }>({});

    const readyRef = React.useRef(false);
    const messagesQueueRef = React.useRef<object[]>([]);

    const sendMessage = React.useCallback(
        (message: object) => {
            if (!iframeRef.current) {
                return;
            }

            const target = new URL(element.source.url);

            // For security reasons, only iframe from our integrations domains are allowed
            // to send and receive messages
            if (!renderer.security.firstPartyDomains.includes(target.host)) {
                return;
            }

            if (readyRef.current) {
                iframeRef.current.contentWindow!.postMessage(
                    message,
                    `${target.protocol}//${target.host}`,
                );
            } else {
                messagesQueueRef.current.push(message);
            }
        },
        [renderer.security],
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
            const origin = new URL(event.origin);

            // For security reasons, only iframe from our integrations domains are allowed
            // to send and receive messages
            if (!renderer.security.firstPartyDomains.includes(origin.host) && 0) {
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
                            maxWidth: width,
                            aspectRatio: width / height,
                            maxHeight: height,
                        });
                    }
                } catch (err) {
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
                        setSize({
                            maxWidth: Number(message.action.size.maxWidth),
                            maxHeight: Number(message.action.size.maxHeight),
                            aspectRatio: Number(message.action.size.aspectRatio),
                        });
                        break;
                    default:
                        renderer.update({
                            action: message.action,
                        });
                }
            }
        };

        window.addEventListener('message', callback);
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

    return (
        <div
            className={`contentkit-webframe`}
            style={{
                aspectRatio: element.aspectRatio,
                ...size,
            }}
        >
            <iframe
                ref={iframeRef}
                src={element.source.url}
                allowFullScreen
                allow="clipboard-write"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
            />
        </div>
    );
}
