'use client';

import React from 'react';
import {
    type AIMessageRenderStream,
    streamAIResponseById,
    streamGenerateAIPage,
} from './server-actions';

export type AIPageState = {
    /**
     * The body of the page.
     */
    body: React.ReactNode;

    /**
     * The ID of the latest AI response.
     */
    responseId: string | null;
};

export type AIPageController = {
    /**
     * Generate a new page for a query.
     */
    generate: (query: string) => void;
};

/**
 * Hook to generate a page using AI.
 */
export function useAIPage(
    props: {
        initialResponseId?: string;
    } = {}
): [AIPageState, AIPageController] {
    const { initialResponseId } = props;
    const [responseId, setResponseId] = React.useState<string | null>(null);
    const [body, setBody] = React.useState<React.ReactNode>('');
    const currentStreamRef = React.useRef<AIMessageRenderStream | null>(null);
    const lastResponseIdRef = React.useRef<string | undefined>(props.initialResponseId);

    /**
     * Update the page body with the content of the stream.
     */
    const generateFromStream = React.useCallback(
        async (rawStream: AIMessageRenderStream | Promise<AIMessageRenderStream>) => {
            currentStreamRef.current = null;
            const stream = await rawStream;
            if (currentStreamRef.current) {
                // If there's already a stream, we don't want to process this one.
                return;
            }
            currentStreamRef.current = stream;

            try {
                for await (const data of stream) {
                    if (currentStreamRef.current !== stream) {
                        // If the stream has changed, we don't want to process this one.
                        return;
                    }
                    if (!data) continue;

                    setBody(data.content);

                    switch (data.event.type) {
                        case 'response_finish':
                            lastResponseIdRef.current = data.event.responseId;
                            setResponseId(data.event.responseId);
                            break;
                    }
                }
            } catch (error) {
                console.error('Error in summary stream:', error);
            }
        },
        []
    );

    /**
     * Initialize the page with the initial response id
     */
    React.useEffect(() => {
        if (initialResponseId) {
            generateFromStream(
                streamAIResponseById({
                    responseId: initialResponseId,
                    options: {
                        renderToolCalls: false,
                    },
                })
            );
        }
    }, [generateFromStream, initialResponseId]);

    /**
     * Generate a new page for a query.
     */
    const generate = React.useCallback(
        async (query: string) => {
            generateFromStream(
                streamGenerateAIPage({
                    query,
                    previousResponseId: lastResponseIdRef.current,
                    options: {
                        renderToolCalls: false,
                    },
                })
            );
        },
        [generateFromStream]
    );

    const state = React.useMemo(
        () => ({
            body,
            responseId,
        }),
        [body, responseId]
    );

    const controller = React.useMemo(
        () => ({
            generate,
        }),
        [generate]
    );

    return [state, controller];
}
