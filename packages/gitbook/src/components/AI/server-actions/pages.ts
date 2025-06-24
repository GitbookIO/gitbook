'use server';
import { AIMessageRole, AIModel } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';

const MARKDOWN_SYNTAX_PROMPT = `
## Markdown syntax

You can use all the markdown syntax supported by GitHub Flavored Markdown (headings, paragraphs, code blocks, lists, tables, etc).

And you also can use advanced blocks using Liquid syntax, the supported advanced blocks are:

#### Tabs

The tabs block can be used to represent alternatives of content (programming languages, operating systems, etc).

Syntax example:

\`\`\`
{% tabs %}
{% tab title="Foo" %}
First tab content.
{% endtab %}

{% tab title="Bar" %}
Second tab content.
{% endtab %}
{% endtabs %}
\`\`\`

#### Stepper

The stepper block can be used to represent a multi-steps process to the user.

Syntax example:

\`\`\`
{% stepper %}
{% step %}
## First step

First step content.
{% endstep %}

{% step %}
## Second step

Second step content.
{% endstep %}
{% endstepper %}
\`\`\`

`;

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
    const { dataFetcher } = await getServerActionBaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const api = await dataFetcher.api();
    const rawStream = await api.orgs.streamAiResponseInSite(
        siteURLData.organization,
        siteURLData.site,
        {
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
        }
    );

    const { stream } = await streamRenderAIMessage(rawStream, options);

    for await (const output of stream) {
        yield output;
    }
}
