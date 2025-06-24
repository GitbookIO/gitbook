import React from 'react';
import {
    type AIMessageRenderStream,
    streamAIResponseById,
    streamGenerateAIPage,
} from './server-actions';

/**
 * Hook to generate a page using AI.
 */
export function useAIPage(
    props: {
        initialResponseId?: string;
    } = {}
) {
    const { initialResponseId } = props;
    const [responseId, setResponseId] = React.useState<string | null>(null);
    const [body, setBody] = React.useState<React.ReactNode>('');
    const currentStreamRef = React.useRef<AIMessageRenderStream | null>(null);

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
    const generate = async (query: string) => {
        generateFromStream(
            streamGenerateAIPage({
                query,
                previousResponseId: responseId ?? props.initialResponseId,
                options: {
                    renderToolCalls: false,
                },
            })
        );
    };

    return {
        body,
        responseId,
        generate,
    };
}
