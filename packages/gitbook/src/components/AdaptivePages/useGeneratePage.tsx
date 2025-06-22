import type { AIStreamResponse } from '@gitbook/api';
import React from 'react';
import { streamGeneratePage, streamResponseById } from './server-actions';

export function useGeneratePage(
    props: {
        initialResponseId?: string;
    } = {}
) {
    const { initialResponseId } = props;
    const [responseId, setResponseId] = React.useState<string | null>(null);
    const [body, setBody] = React.useState<React.ReactNode>('');

    const generateFromStream = React.useCallback(
        async (
            stream: AsyncIterable<{
                content: React.ReactNode;
                event: AIStreamResponse;
            }>
        ) => {
            try {
                for await (const data of stream) {
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

    // Initialize the page with the initial response id
    React.useEffect(() => {
        if (initialResponseId) {
            streamResponseById({
                responseId: initialResponseId,
            }).then((stream) => generateFromStream(stream));
        }
    }, [generateFromStream, initialResponseId]);

    // Generate a new page
    const generate = async (query: string) => {
        generateFromStream(
            await streamGeneratePage({
                query,
                previousResponseId: responseId ?? props.initialResponseId,
            })
        );
    };

    return {
        body,
        responseId,
        generate,
    };
}
