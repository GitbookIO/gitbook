'use server';
import { headers } from 'next/headers';

import {
    type AIMessageContext,
    AIMessageRole,
    AIModel,
    type AIToolCallResult,
    type AIToolDefinition,
    SiteCoreChannelType,
    type SiteInsightsSession,
} from '@gitbook/api';

import { streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { getAskForwardedHeaders, getAskVisitorAgent } from '@/lib/ask-visitor';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';

/**
 * Generate a response to a chat message.
 */
export async function* streamAIChatResponse({
    message,
    messageContext,
    previousResponseId,
    toolCall,
    tools,
    session,
    options,
}: {
    message?: string;
    messageContext: AIMessageContext;
    previousResponseId?: string;
    toolCall?: AIToolCallResult;
    tools?: AIToolDefinition[];
    session: SiteInsightsSession;
    options?: RenderAIMessageOptions;
}) {
    const { stream } = await traceErrorOnly('AI.streamAIChatResponse', async () => {
        const context = await getServerActionBaseContext({
            isEmbeddable: options?.asEmbeddable,
        });

        const siteContext = await fetchServerActionSiteContext(context);
        if (!isAIChatEnabled(siteContext.customization.ai.mode)) {
            throw new Error('The AI Assistant is not enabled for this site.');
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
                session,
                channel: {
                    type: options?.asEmbeddable
                        ? SiteCoreChannelType.Embed
                        : SiteCoreChannelType.Site,
                },
            },
            { headers: getAskForwardedHeaders(getAskVisitorAgent(await headers())) }
        );

        return await streamRenderAIMessage(context, rawStream, options);
    });

    for await (const output of stream) {
        yield output;
    }
}
