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

    const [{ stream }] = await Promise.all([
        streamGenerateObject(
            baseContext,
            {
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
            },
            {
                schema: z.object({
                    highlight: z
                        .string()
                        .describe('The reason why the user should read the target page.'),
                    // questions: z.array(z.string().describe('The questions to sea')).max(3),
                }),
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content: `# 1. Role
You are a documentation navigator. Your job is to help the user read documentation more efficiently.

# 2. Task
Using the user's navigation history and the target page content, produce an answer that:
- Tells the user **why they should read the target page**.
- Relates strongly to what the user already knows and what they're currently reading.
- Is very succinct and direct, using a one or two sentences. Don't combine sentences with commas. 

# 3. Instructions
1. Identify the key paragraph surrounding the link's text (e.g., "change request") from the current page.
2. Extract and combine relevant information from the target page to address the link's context.
3. Leave out information that's already covered in the link preview or previous pages.
4. Combine in one sentence that is direct and brief. Be concise, avoid long words and fluffy language.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# 4. Examples
- Start immediately with a fact.
- Use specific details from the target page. Don't just summarise it.
- Don't refer to the page itself, so avoid using "the page", "it contains", "it explains", etc.
- Remain neutral about importance, so avoid using "crucial", "important", "urgent", etc.

## Example 1
- Link context: "You can create a redirect to any (section)[/sections] of your site."
- Link preview: "Sections: Organise your site into different parts."
- Response: "Another way to split up content is with Variants. Redirects to a section will target the first page of the section."

## Example 2
- Link context: "This feature is only available on the (Ultimate plan)[/pricing]."
- Link preview: "Pricing: Learn about our different pricing tiers."
- Response: "Contains info about the Ultimate plan, which is required for most of the features you viewed. It costs $25 per month. A Pro plan is available too."

## Example 3
- Link context: "You can use (keyboard shortcuts)[/keyboard-shortcuts] to get to the Search menu faster."
- Link preview: "Keyboard shortcuts: A quick reference guide to all the keyboard shortcuts available."
- Response: "Relevant shortcuts for you include ⌘/Ctrl+K for Search, ⌘/Ctrl+I for Italics, and ⌘/Ctrl+B for Bold."

## Example 4
- Link context: "This feature can only be enabled by an (admin)[/roles]."
- Link preview: "Roles: An overview of the different roles on the platform."
- Response: "The features you've read about require Editor or Admin roles. The admin role is reserved for the creator of the organisation."`,
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
                        content: `I'm considering reading the link titled "${linkTitle}". Give the most relevant information given what I already know. Relate to the instructions and examples above. Don't explain what the page is about, just why I should read it.`,
                    },
                ].filter(filterOutNullable),
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    for await (const value of stream) {
        const highlight = value.highlight;
        if (!highlight) {
            continue;
        }

        yield highlight;
    }
}
