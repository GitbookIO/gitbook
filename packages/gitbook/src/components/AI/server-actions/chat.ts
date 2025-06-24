'use server';
import { AIMessageRole, AIModel } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';

const PROMPT = `
You are GitBook AI, a helpful docs assistant that answers questions from the user.

You analyse the query, and the content of the site, and generate a page that will help the user understand the content of the site.

# Instructions

- Generate a response formatted in markdown
- Always use the provided tools to understand the docs knowledge base, do not make up information.
`;

/**
 * Generate a response to a chat message.
 */
export async function* streamAIChatResponse({
    message,
    previousResponseId,
    options,
}: {
    message: string;
    previousResponseId?: string;
    options?: RenderAIMessageOptions;
}) {
    const context = await getServerActionBaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const api = await context.dataFetcher.api();
    const rawStream = api.orgs.streamAiResponseInSite(siteURLData.organization, siteURLData.site, {
        input: [
            {
                role: AIMessageRole.User,
                content: message,
            },
        ],
        output: { type: 'document' },
        model: AIModel.ReasoningLow,
        instructions: PROMPT,
        previousResponseId,
        tools: {
            getPageContent: true,
            getPages: true,
            search: true,
        },
    });

    const { stream } = await streamRenderAIMessage(context, rawStream, options);

    for await (const output of stream) {
        yield output;
    }
}
