'use server';
import { getEmbeddableLinker } from '@/lib/embeddable';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';
import {
    type AIMessageContext,
    AIMessageRole,
    AIModel,
    type AIToolCallResult,
    type AIToolDefinition,
} from '@gitbook/api';
import { streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';

/**
 * Generate a response to a chat message.
 */
export async function* streamAIChatResponse({
    message,
    messageContext,
    previousResponseId,
    toolCall,
    tools,
    options,
}: {
    message?: string;
    messageContext: AIMessageContext;
    previousResponseId?: string;
    toolCall?: AIToolCallResult;
    tools?: AIToolDefinition[];
    options?: RenderAIMessageOptions;
}) {
    const { stream } = await traceErrorOnly('AI.streamAIChatResponse', async () => {
        let context = await getServerActionBaseContext();
        if (options?.asEmbeddable) {
            context = { ...context, linker: getEmbeddableLinker(context.linker) };
        }

        const siteURLData = await getSiteURLDataFromMiddleware();

        const api = await context.dataFetcher.api();
        const rawStream = api.orgs.streamAiResponseInSite(
            siteURLData.organization,
            siteURLData.site,
            {
                input: message
                    ? [
                          {
                              role: AIMessageRole.User,
                              content: message,
                              context: messageContext,
                          },
                      ]
                    : [],
                model: AIModel.ReasoningLow,
                previousResponseId,
                toolCall,
                tools,
            }
        );

        return await streamRenderAIMessage(context, rawStream, options);
    });

    for await (const output of stream) {
        yield output;
    }
}
