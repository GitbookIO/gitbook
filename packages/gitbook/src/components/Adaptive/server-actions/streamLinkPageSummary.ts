'use server';
import { filterOutNullable } from '@/lib/typescript';
import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import { AIMessageRole } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@v2/lib/server-actions';
import { z } from 'zod';
import { streamGenerateObject } from './api';

/**
 * Get a summary of a page, in the context of another page
 */
export async function* streamLinkPageSummary({
    currentSpaceId,
    currentPageId,
    targetSpaceId,
    targetPageId,
    linkPreview,
    linkTitle,
    visitedPages,
}: {
    currentSpaceId: string;
    currentPageId: string;
    targetSpaceId: string;
    targetPageId: string;
    linkPreview?: string;
    linkTitle?: string;
    visitedPages?: Array<{ spaceId: string; pageId: string }>;
}) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const [{ stream, response }] = await Promise.all([
        streamGenerateObject(
            baseContext,
            {
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
            },
            {
                schema: z.object({
                    highlight: z.string().describe('The most important content of the target page'),
                    // questions: z.array(z.string().describe('The questions to sea')).max(3),
                }),
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content: `# 1. Role
You are a documentation navigator. Your job is to help the user read documentation more efficiently. Your aim is to prevent the user from having to read the target page by giving them all the information they need to know.

# 2. Task
Using both the current page context and the target page content, produce a page highlight that:
- Highlights the key facts from the target page.
- Relates strongly to the topic the user is currently reading about.
- Is very succinct and direct, using only one or two short sentences (each sentence using no more than one comma).
- Remains strictly factual, without referring to "the page".

# 3. Instructions
1.	Identify the key paragraph surrounding the link's text (e.g., "change request") from the current page.
2.	Extract and combine relevant information from the target page to address the link's context.
3.	Combine in one or two short sentences that are direct and brief.

# 4. Examples
## Example 1
- Link context: "This feature is only available on the Ultimate plan."
- Link preview: "Pricing: Learn about our different pricing tiers."
- Response: "The Ultimate plan costs $25 per month. A Pro plan is available too."

## Example 2
- Link context: "You can use keyboard shortcuts to get to the Search menu faster."
- Link preview: "Keyboard shortcuts: A quick reference guide to all the keyboard shortcuts available."
- Response: "To open the Search menu, use the keyboard shortcut ⌘K or Ctrl+K."

## Example 3
- Link context: "This feature can only be enabled by an admin."
- Link preview: "Roles: An overview of the different roles on the platform."
- Response: "The admin role is reserved for the creator of the organisation."`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# 5. Current page
The content of the current page is:`,
                        attachments: [
                            {
                                type: 'page' as const,
                                spaceId: currentSpaceId,
                                pageId: currentPageId,
                            },
                        ],
                    },
                    ...(visitedPages
                        ? [
                              {
                                  role: AIMessageRole.Developer,
                                  content: '# 6. Previous pages',
                              },
                              ...visitedPages.map(({ spaceId, pageId }) => ({
                                  role: AIMessageRole.Developer,
                                  content: `## Page ${pageId}`,
                                  attachments: [
                                      {
                                          type: 'page' as const,
                                          spaceId,
                                          pageId,
                                      },
                                  ],
                              })),
                          ]
                        : []),
                    {
                        role: AIMessageRole.Developer,
                        content: `# 7. Target page
The content of the target page is:`,
                        attachments: [
                            {
                                type: 'page' as const,
                                spaceId: targetSpaceId,
                                pageId: targetPageId,
                            },
                        ],
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# 8. Link preview
The content of the link preview is:
> ${linkPreview}`,
                    },
                    {
                        role: AIMessageRole.User,
                        content: `I'm considering reading the link titled "${linkTitle}" to page ID ${targetPageId}. Give the most relevant information from this page. Relate it to my current page and in particular the paragraph I'm currently reading. Be very concise.`,
                    },
                ].filter(filterOutNullable),
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    console.log((await response).responseId);

    for await (const value of stream) {
        const highlight = value.highlight;
        if (!highlight) {
            continue;
        }

        yield highlight;
    }
}
