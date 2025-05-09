'use server';
import {
    type AIMessageInput,
    AIModel,
    type AIStreamResponse,
    type AIToolCapabilities,
} from '@gitbook/api';
import type { GitBookBaseContext } from '@v2/lib/context';
import { EventIterator } from 'event-iterator';
import type { MaybePromise } from 'p-map';
import * as partialJson from 'partial-json';
import type { DeepPartial } from 'ts-essentials';
import type { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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
        organizationId,
        siteId,
    }: {
        organizationId: string;
        siteId: string;
    },
    {
        schema,
        messages,
        model = AIModel.Fast,
        tools = {},
    }: {
        schema: z.ZodSchema<T>;
        messages: AIMessageInput[];
        model?: AIModel;
        previousResponseId?: string;
        tools?: AIToolCapabilities;
    }
) {
    const rawStream = context.dataFetcher.streamAIResponse({
        organizationId,
        siteId,
        input: messages,
        output: {
            type: 'object',
            schema: zodToJsonSchema(schema),
        },
        tools,
        model,
    });

    let json = '';
    return parseResponse<DeepPartial<T>>(rawStream, (event) => {
        if (event.type === 'response_object' && event.jsonChunk) {
            json += event.jsonChunk;

            const parsed = partialJson.parse(json, partialJson.ALL);
            return parsed;
        }
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
