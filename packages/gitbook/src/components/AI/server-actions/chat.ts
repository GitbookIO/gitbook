'use server';
import { type AIMessageContext, AIMessageRole, AIModel } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { z } from 'zod';
import { streamGenerateAIObject, streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';

const PROMPT = `
You are GitBook AI, a helpful docs assistant that answers questions from the user.

You analyse the query, and the content of the site, and generate a page that will help the user understand the content of the site.

# Instructions

- Generate a response formatted in markdown
- Always use the provided tools to understand the docs knowledge base, do not make up information.
`;

const FOLLOWUP_PROMPT = `
Generate a short JSON list with message suggestions for a user to post in a chat. The suggestions will be displayed next to the text input, allowing the user to quickly tap and pick one.

# Guidelines

- Ensure suggestions are concise and relevant for general chat conversations.
- Limit the length of each suggestion to ensure quick readability and tap selection.
- Suggest at most 3 responses.
- Only suggest responses that are relevant followup to the conversation, otherwise return an empty list.
- When the last message finishes with questions, suggest responses that answer the questions.

# Output Format

Provide the suggestions as a JSON array with each suggestion as a string. Ensure the suggestions are short and suitable for quick tapping.
`;

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
    const context = await getServerActionBaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const api = await context.dataFetcher.api();
    const rawStream = api.orgs.streamAiResponseInSite(siteURLData.organization, siteURLData.site, {
        input: [
            {
                role: AIMessageRole.User,
                content: message,
                context: messageContext,
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

/**
 * Stream suggestions of follow-up responses for the user.
 */
export async function* streamAIChatFollowUpResponses({
    previousResponseId,
}: {
    previousResponseId: string;
}) {
    const context = await getServerActionBaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const { stream, response } = await streamGenerateAIObject(context, {
        organizationId: siteURLData.organization,
        siteId: siteURLData.site,
        schema: z.object({
            suggestions: z.array(z.string()),
        }),
        previousResponseId,
        input: [
            {
                role: AIMessageRole.User,
                content:
                    'Suggest quick-tap responses the user might want to pick from to continue the previous chat conversation.',
            },
        ],
        model: AIModel.Fast,
        instructions: FOLLOWUP_PROMPT,
    });

    for await (const output of stream) {
        yield (output.suggestions ?? []).filter((suggestion) => !!suggestion) as string[];
    }

    console.log('response', { previousResponseId }, await response);
}
