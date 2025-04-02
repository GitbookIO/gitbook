'use server';
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
}: {
    currentSpaceId: string;
    currentPageId: string;
    targetSpaceId: string;
    targetPageId: string;
    linkPreview?: string;
    linkContext?: string;
    previousPageIds?: string[];
}) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const [{ stream, response }, context] = await Promise.all([
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
                        content: `# Task
You are a documentation navigator, tasked with extracting information from pages the user might navigate to next.
The user is currently reading a page, and is considering clicking a link to another ("target") page. 
Use the user's context and the page they are currently on.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# Context
## Current page
The user is currently on page ID ${currentPageId}, the content of this page is:`,
                        attachments: [
                            {
                                type: 'page',
                                spaceId: currentSpaceId,
                                pageId: currentPageId,
                            },
                        ],
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `## Link context
The user is inspecting a link to page ID ${targetPageId}. Look for this ID in the current article and inspect the paragraph that surrounds it, to understand the link context.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `## Link preview: 
This text is displayed directly above your summary. Use pronouns to reference concepts that have already been introduced in this preview.
${linkPreview}`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# Target page
The content of the target page is:`,
                        attachments: [
                            {
                                type: 'page',
                                spaceId: targetSpaceId,
                                pageId: targetPageId,
                            },
                        ],
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `---
# Formatting
## Style guide
- Respond with one or two sentences maximum. 
- Keep sentences short. Don't use more than 1 comma per sentence.
- Stick to the facts on the target page.
- Do not reference "the page" itself.

## Example 1
- Link context:
  > This feature is only available on the [Ultimate plan](/pricing).
- Link preview:
  > **Pricing**
  > Learn about our different pricing tiers.
- Correct response: 
  > The Ultimate plan costs $25 per month. A Pro plan is available too.

## Example 2
- Link context:
  > You can use [keyboard shortcuts](/keyboard-shortcuts) to get to the Search menu faster.
- Link preview:
  > **Keyboard shortcuts**
  > A quick reference guide to all the keyboard shortcuts available.
- Correct response: 
  > To open the Search menu, use the keyboard shortcut ⌘K or Ctrl+K.

## Example 3
- Link context:
  > This feature can only be enabled by an [admin](/roles).
- Link preview:
  > **Roles**
  > An overview of the different roles on the platform.
- Correct response: 
  > The admin role is reserved for the creator of the organisation.`,
                    },
                    {
                        role: AIMessageRole.User,
                        content: `I'm considering reading page ID ${targetPageId}. Give the most relevant information from this page. Please relate it to my current page.`,
                    },
                ],
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    console.log(await response);

    const emitted = new Set<string>();
    for await (const value of stream) {
        const highlight = value.highlight;
        if (!highlight) {
            continue;
        }

        yield highlight;

        // for (const pageId of pages) {
        //     if (!pageId) {
        //         continue;
        //     }

        //     if (emitted.has(pageId)) {
        //         continue;
        //     }

        //     emitted.add(pageId);

        //     const page = resolvePageId(context.pages, pageId);
        //     if (!page) {
        //         continue;
        //     }

        //     yield {
        //         title: page.page.title,
        //         href: context.linker.toPathForPage({
        //             pages: context.pages,
        //             page: page.page,
        //         }),
        //     };
        // }
    }
}
