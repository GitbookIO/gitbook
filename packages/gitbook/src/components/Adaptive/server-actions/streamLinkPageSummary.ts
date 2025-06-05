'use server';
import { filterOutNullable } from '@/lib/typescript';
import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import { AIMessageRole, AIModel } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
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
    currentPageTitle: string;
    targetSpaceId: string;
    targetPageId: string;
    linkPreview?: string;
    linkTitle?: string;
    visitedPages?: Array<{ spaceId: string; pageId: string }>;
}) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const { stream } = await streamGenerateObject(baseContext, {
        organizationId: siteURLData.organization,
        siteId: siteURLData.site,
        model: AIModel.Fast,
        schema: z.object({
            highlight: z.string().describe('The reason why the user should read the target page.'),
            // questions: z.array(z.string().describe('The questions to sea')).max(3),
        }),
        input: [
            {
                role: AIMessageRole.Developer,
                content: `# 1. Role
You are a contextual fact extractor. Your job is to find the exact fact from the linked page that directly answers the implied question in the current paragraph.

# 2. Task
Extract a contextually-relevant fact that:
- Directly answers the specific need or question implied by the link's placement
- States a capability, limitation, or specification from the target page
- Connects precisely to the user's current paragraph or sentence 
- Completes the user's understanding based on what they're currently reading

# 3. Instructions
1. First, identify the exact need, question, or gap in the current paragraph where the link appears
2. Find the specific fact in the target page that addresses this exact contextual need
3. Ensure the fact relates directly to the context of the paragraph containing the link
4. Avoid ALL instructional language including words like "use", "click", "select", "create"
5. Keep it under 30 words, factual and declarative about what EXISTS or IS TRUE`,
            },
            {
                role: AIMessageRole.Developer,
                content: `# 4. Current page
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
                          content: '# 5. Previous pages',
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
                content: `# 6. Target page
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
                content: `# 7. Link preview
The content of the link preview is:
> ${linkPreview}
> Page ID: ${targetPageId}`,
            },
            {
                role: AIMessageRole.Developer,
                content: `# 8. Guidelines & Examples
ALWAYS:
- ALWAYS choose facts that directly fulfill the contextual need where the link appears
- ALWAYS connect target page information specifically to the current paragraph context
- ALWAYS focus on the gap in knowledge that the link is meant to fill
- ALWAYS consider user's navigation history to ensure contextual continuity
- ALWAYS use action verbs like "click", "select", "use", "create", "enable"

NEVER:
- NEVER include ANY unspecifc language like "learn", "how to", "discover", etc. State the fact directly.
- NEVER select general facts unrelated to the specific link context
- NEVER ignore the specific context where the link appears
- NEVER repeat the same fact in different words

## Examples 
Current paragraph: "When organizing content, headings are limited to 3 levels. For more advanced editing, you can use (multiple select)[/multiple-select] to move multiple blocks at once."
Preview: "Multiple Select: Select multiple content blocks at once."
✓ "Shift selects content between two points, useful for reorganizing your current heading structure."
✗ "Shift and Ctrl/Cmd keys are the modifiers for selecting multiple blocks."

Current paragraph: "Most changes can be published directly, but for major revisions, if you want others to review changes before publishing, create a (change request)[/change-requests]."
Preview: "Change Requests: Collaborative content editing workflow."
✓ "Each reviewer's approval is tracked separately, with specific change highlighting for your major revisions."
✗ "Each reviewer receives an email notification and can approve or request changes."

Current paragraph: "Your team mentioned issues with conflicting edits. Need to collaborate in real-time? You can use (live edit mode)[/live-edit]."
Preview: "Live Edit: Real-time collaborative editing."
✓ "Teams with GitHub repositories (like yours) cannot use this feature due to sync limitations."
✗ "Incompatible with GitHub/GitLab sync and requires specific visibility settings."`,
            },
            {
                role: AIMessageRole.User,
                content: `I'm considering reading the link titled "${linkTitle}" pointing to page ${targetPageId}. Why should I read it? Relate it to the paragraph I'm currently reading.`,
            },
        ].filter(filterOutNullable),
    });

    for await (const value of stream) {
        const highlight = value.highlight;
        if (!highlight) {
            continue;
        }

        yield highlight;
    }
}
