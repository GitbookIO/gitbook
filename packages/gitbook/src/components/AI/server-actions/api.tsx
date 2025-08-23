'use server';
import type { GitBookBaseContext } from '@/lib/context';
import { fetchServerActionSiteContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';
import {
    type AIMessage,
    AIMessageRole,
    type AIMessageStep,
    type AIStreamResponse,
} from '@gitbook/api';
import { EventIterator } from 'event-iterator';
import { AIMessageView } from './AIMessageView';
import type { RenderAIMessageOptions } from './types';

/**
 * Stream the generation of a document.
 */
export async function streamRenderAIMessage(
    baseContext: GitBookBaseContext,
    rawStream: AsyncIterable<AIStreamResponse>,
    options?: RenderAIMessageOptions
) {
    return traceErrorOnly('AI.streamRenderAIMessage', async () => {
        const message: AIMessage = {
            id: '',
            role: AIMessageRole.Assistant,
            steps: [],
        };

        const updateProcessingMessageStep = (
            stepIndex: number,
            callback: (step: AIMessageStep) => void
        ) => {
            if (stepIndex > message.steps.length) {
                throw new Error(
                    `Step index out of bounds ${stepIndex} (${message.steps.length} steps)`
                );
            }

            if (message.steps[stepIndex]) {
                message.steps = [...message.steps];
                // @ts-expect-error
                message.steps[stepIndex] = { ...message.steps[stepIndex] };
                // @ts-expect-error
                callback(message.steps[stepIndex]);
            } else {
                message.steps = [
                    ...message.steps,
                    {
                        content: {
                            object: 'document',
                            data: {},
                            nodes: [],
                        },
                    },
                ];
                // @ts-expect-error
                callback(message.steps[stepIndex]);
            }
        };

        // Fetch the full-context in the background to avoid blocking the stream.
        const promiseContext = fetchServerActionSiteContext(baseContext);

        return parseResponse<{
            content: React.ReactNode;
            event: AIStreamResponse;
        }>(rawStream, async (event) => {
            switch (event.type) {
                /**
                 * The agent is processing a tool call in a new message.
                 */
                case 'response_tool_call': {
                    updateProcessingMessageStep(event.stepIndex, (step) => {
                        step.toolCalls ??= [];
                        step.toolCalls.push(event.toolCall);
                    });
                    break;
                }

                /**
                 * The agent is writing the content of a new message.
                 */
                case 'response_reasoning':
                case 'response_document': {
                    updateProcessingMessageStep(event.stepIndex, (step) => {
                        const container =
                            event.type === 'response_reasoning' ? 'reasoning' : 'content';

                        step[container] ??= {
                            object: 'document',
                            data: {},
                            nodes: [],
                        };
                        step[container] = {
                            ...step[container],
                            nodes: [...step[container].nodes],
                        };
                        if (event.operation === 'insert') {
                            step[container].nodes.push(...event.blocks);
                        } else {
                            step[container].nodes.splice(
                                -event.blocks.length,
                                event.blocks.length,
                                ...event.blocks
                            );
                        }
                    });
                    break;
                }
            }

            return {
                event,
                content: (
                    <AIMessageView message={message} context={await promiseContext} {...options} />
                ),
            };
        });
    });
}

/**
 * Parse a stream from the API to extract the responseId.
 */
function parseResponse<T>(
    responseStream: EventIterator<AIStreamResponse>,
    parse: (response: AIStreamResponse) => T | undefined | Promise<T | undefined>
): {
    stream: EventIterator<T>;
    response: Promise<{ responseId: string }>;
} {
    let resolveResponse: (value: { responseId: string }) => void;
    const response = new Promise<{ responseId: string }>((resolve) => {
        resolveResponse = resolve;
    });

    const stream = new EventIterator<T>((queue) => {
        (async () => {
            let foundResponse = false;

            for await (const event of responseStream) {
                const parsed = await parse(event);
                if (parsed !== undefined) {
                    queue.push(parsed);
                }

                if (event.type === 'response_finish') {
                    foundResponse = true;
                    resolveResponse({ responseId: event.responseId });
                }
            }

            if (!foundResponse) {
                throw new Error('No response found');
            }
        })().then(
            () => {
                queue.stop();
            },
            (error) => {
                queue.fail(error);
            }
        );
    });

    return { stream, response };
}
