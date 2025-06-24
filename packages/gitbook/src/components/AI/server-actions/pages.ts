'use server';
import { AIMessageRole, AIModel } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { streamRenderAIMessage } from './api';
import { MARKDOWN_SYNTAX_PROMPT } from './prompts';
import type { RenderAIMessageOptions } from './types';

const PROMPT = `
You are GitBook AI, a helpful docs assistant that can generate an optimized page for a given query.

You analyse the query, and the content of the site, and generate a page that will help the user understand the content of the site.

# Instructions

- Generate a complete page formatted in markdown
- Always start the page with a markdown heading 1 (\`# Title of the page\`)
- Use the provided tools to understand the site content.

${MARKDOWN_SYNTAX_PROMPT}
`;

/**
 * Generate a page using AI.
 */
export async function* streamGenerateAIPage({
    query,
    previousResponseId,
    options,
}: {
    query: string;
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
                content: query,
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
