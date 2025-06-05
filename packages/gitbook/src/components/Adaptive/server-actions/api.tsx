'use server';
import {
    type AIMessage,
    AIMessageRole,
    type AIMessageStep,
    type AIStreamResponse,
} from '@gitbook/api';
import type { GitBookBaseContext } from '@v2/lib/context';
import type { GitBookDataFetcher } from '@v2/lib/data';
import { EventIterator } from 'event-iterator';
import type { MaybePromise } from 'p-map';
import * as partialJson from 'partial-json';
import type { DeepPartial } from 'ts-essentials';
import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { MessageView } from '../MessageView';

/**
 * Get the latest value from a stream and the response id.
 */
export async function generate<T>(
    promise: MaybePromise<{
        stream: EventIterator<T>;
        response: Promise<{ responseId: string }>;
    }>
) {
    const input = await promise;
    let value: T | undefined;

    for await (const event of input.stream) {
        value = event;
    }

    const { responseId } = await input.response;
    return {
        responseId,
        value,
    };
}

/**
 * Stream the generation of an object using the AI.
 */
export async function streamGenerateObject<T>(
    context: GitBookBaseContext,
    {
        schema,
        ...input
    }: Omit<Parameters<GitBookDataFetcher['streamAIResponse']>[0], 'output'> & {
        schema: z.ZodSchema<T>;
    }
) {
    const rawStream = context.dataFetcher.streamAIResponse({
        ...input,
        output: {
            type: 'object',
            schema: zodToJsonSchema(schema),
        },
    });

    let json = '';
    return parseResponse<DeepPartial<T>>(rawStream, (event) => {
        if (event.type === 'response_object') {
            json += event.jsonChunk;

            const parsed = partialJson.parse(json, partialJson.ALL);
            return parsed;
        }
    });
}

/**
 * Stream the generation of a document.
 */
export async function streamGenerateDocument(
    context: GitBookBaseContext,
    input: Omit<Parameters<GitBookDataFetcher['streamAIResponse']>[0], 'output'>
) {
    const rawStream = context.dataFetcher.streamAIResponse({
        ...input,
        output: {
            type: 'document',
        },
    });

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
            message.steps[stepIndex] = { ...message.steps[stepIndex] };
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
            callback(message.steps[stepIndex]);
        }
    };

    return parseResponse<React.ReactNode>(rawStream, (event) => {
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
                    const container = event.type === 'response_reasoning' ? 'reasoning' : 'content';

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

        return <MessageView message={message} />;
    });
}

/**
 * Parse a stream from the API to extract the responseId.
 */
function parseResponse<T>(
    responseStream: EventIterator<AIStreamResponse>,
    parse: (response: AIStreamResponse) => T | undefined
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
                if (event.type === 'response_finish') {
                    foundResponse = true;
                    resolveResponse({ responseId: event.responseId });
                } else {
                    const parsed = parse(event);
                    if (parsed !== undefined) {
                        queue.push(parsed);
                    }
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
