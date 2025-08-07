'use server';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';
import { type AIMessageContext, AIMessageRole, AIModel } from '@gitbook/api';
import { streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';

/**
 * Generate a response to a chat message.
 */
export async function* streamAIChatResponse({
    message,
    messageContext,
    previousResponseId,
    options,
}: {
    message: string;
    messageContext: AIMessageContext;
    previousResponseId?: string;
    options?: RenderAIMessageOptions;
}) {
    const { stream } = await traceErrorOnly('AI.streamAIChatResponse', async () => {
        const context = await getServerActionBaseContext();
        const siteURLData = await getSiteURLDataFromMiddleware();

        const api = await context.dataFetcher.api();
        const rawStream = api.orgs.streamAiResponseInSite(
            siteURLData.organization,
            siteURLData.site,
            {
                mode: 'assistant',
                input: [
                    {
                        role: AIMessageRole.User,
                        content: message,
                        context: messageContext,
                    },
                ],
                output: { type: 'document' },
                model: AIModel.ReasoningLow,
                previousResponseId,
            }
        );

        return await streamRenderAIMessage(context, rawStream, options);
    });

    for await (const output of stream) {
        yield output;
    }
}
