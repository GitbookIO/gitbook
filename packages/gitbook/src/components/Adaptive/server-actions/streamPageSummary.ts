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
export async function* streamPageSummary({
    currentPage,
    currentSpace,
    visitedPages,
}: {
    currentPage: {
        id: string;
        title: string;
    };
    currentSpace: {
        id: string;
        // title: string;
    };
    visitedPages: {
        pageId: string;
        spaceId: string;
    }[];
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
                    keyFacts: z
                        .string()
                        .describe(
                            'A collection of key facts from the page that together form a comprehensive summary. Keep it under 30 words.'
                        ),
                    bigPicture:
                        visitedPages.length > 0
                            ? z
                                  .string()
                                  .describe(
                                      'A natural-sounding summary of how specific concepts connect with real benefits. Use a conversational tone with concrete examples. Avoid overly formal language while still being specific. Keep it under 30 words.'
                                  )
                            : z.undefined(),
                }),
                tools: {
                    // getPages: true,
                    // getPageContent: true,
                },
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content: `# 1. Role
    You are a fact extractor. Your job is to identify and extract the most important facts from the current page.
    
    # 2. Task
    Extract multiple key facts that:
    - Cover the most important concepts, features, or capabilities on the page
    - Represent specific, actionable information rather than general descriptions
    - Provide concrete details about functionality, limitations, or specifications
    - Together form a comprehensive understanding of the page content
    - Relate to the user's learning journey through the documentation when relevant
    
    # 3. Instructions
    1. Analyze the current page to identify 3-5 concrete, specific facts (not general summaries)
    2. Focus on facts that would be most useful and relevant to someone using this documentation
    3. If the user has visited other pages, identify facts that build upon their previous knowledge
    4. Present facts as clear, declarative statements about what exists or is true
    5. Separate distinct facts rather than combining them into a single summary
    6. Include specific details, numbers, limitations, or capabilities where available`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# 4. Current page
    The content of the current page is:`,
                        attachments: [
                            {
                                type: 'page' as const,
                                spaceId: currentSpace.id,
                                pageId: currentPage.id,
                            },
                        ],
                    },
                    ...(visitedPages && visitedPages.length > 0
                        ? [
                              {
                                  role: AIMessageRole.Developer,
                                  content: `# 5. Previous Pages and Learning Journey
    The content across ${visitedPages.length} page(s) builds a knowledge framework. Use this to:
    - Identify specific, concrete ways concepts interact (not just "work together")
    - Show exact functional relationships between ideas (not vague "enhances")
    - Highlight tangible capabilities that emerge from combined concepts
    - Describe precise benefits that result from these connections
    - Focus on what becomes possible when these concepts are combined
    
    The content of up to 5 most recent pages are included below:`,
                              },
                              ...visitedPages.slice(0, 5).map(({ spaceId, pageId }, index) => ({
                                  role: AIMessageRole.Developer,
                                  content: `## Previous Page ${index + 1}: ${pageId}`,
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
                        content: `# 6. Guidelines for Fact Extraction
    ALWAYS:
    - ALWAYS extract multiple distinct facts rather than a single summary
    - ALWAYS focus on specific, concrete details rather than general descriptions
    - ALWAYS include numbers, limitations, requirements, or specifications when available
    - ALWAYS prioritize facts that would be most useful to someone using the documentation
    - ALWAYS consider how facts on this page relate to previously visited pages
    
    NEVER:
    - NEVER use instructional language like "learn", "how to", "discover", etc.
    - NEVER include vague or generic statements that lack specific details.
    - NEVER repeat the page title without adding informative value.
    - NEVER combine multiple distinct facts into a single general statement.
    - NEVER use numbered lists.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `## Examples
    
    Page content: "Content blocks in GitBook include text, images, videos, code snippets, and more. Each block can be customized with specific settings. Text blocks support Markdown formatting and can include inline code. Images can be resized and have alt text added."
    ✓ "Text blocks support Markdown formatting. Images can be resized and include alt text. Available block types include text, images, videos, and code snippets."
    ✗ "GitBook offers various content blocks with customization options."
    
    Page content: "Change Requests allow teams to propose, review, and approve content changes before publishing. Each reviewer's approval is tracked separately. Changes are highlighted with color coding. Change Requests can be merged automatically or manually after approval."
    ✓ "Reviewer approvals are tracked individually. Changes are color-coded for visibility. Merging can be automatic or manual after approval. Multiple reviewers can collaborate on a single Change Request."
    ✗ "Change Requests provide a collaborative workflow for content changes."
    
    Page content: "API authentication requires an API key generated in account settings. Keys expire after 90 days by default. Rate limits are set to 1000 requests per hour. Keys can have read-only or read-write permissions."
    ✓ "API keys expire after 90 days by default. Rate limits are capped at 1000 requests per hour. Keys can be configured with read-only or read-write permissions."
    ✗ "API keys are required for authentication and have various settings."`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `# 7. Guidelines for Big Picture
    For the big picture summary:
    
    ALWAYS:
    - ALWAYS highlight practical patterns and workflows that emerge when combining these concepts.
    - ALWAYS focus on real capabilities that come from understanding multiple features together.
    - ALWAYS use specific examples that show the value of combining these ideas.
    - ALWAYS keep the language simple, direct and conversational without corporate jargon.
    - ALWAYS use short sentences with a single clause and no commas.

    NEVER:
    - NEVER use corporate jargon like "seamless", "ensures", "integrates", etc.
    - NEVER use complex sentences with multiple clauses.
    - NEVER use passive voice.
    - NEVER state the same fact twice.
    - NEVER repeat the page title without adding informative value.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `## Big Picture Examples
    POOR "BIG PICTURE" EXAMPLES TO AVOID:
    ✗ "GitBook combines content creation, collaboration, and integrations, building on your understanding of identifiers and paginated results for seamless documentation management."
    ✗ "The platform's robust features for content organization, versioning, and access control work together to create a powerful documentation ecosystem."
    ✗ "By leveraging GitBook's content blocks, permissions system, and API capabilities, you can build comprehensive documentation solutions."
    
    GOOD "BIG PICTURE" EXAMPLES TO FOLLOW:
    ✓ "Combining Markdown tables with webhook notifications means your API docs stay up-to-date automatically. When you update a parameter, the PDF version refreshes too."
    ✓ "Content blocks and version history together solve the biggest docs headache. You can experiment with different layouts while keeping a clean record of what changed and why."
    ✓ "The real power comes from linking custom domains with content permissions. Your sales team gets branded docs while your developers see the technical details on the same site."
    ✓ "With spaces, webhooks, and custom metadata working together, you're not just making docs. You're building a knowledge system that responds to how your team actually works."`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `The current page is: "${currentPage.title}" (ID ${currentPage.id})`,
                    },
                    {
                        role: AIMessageRole.User,
                        content:
                            'What are the key facts on this page, and what have I learned across the documentation so far?',
                    },
                ],
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    for await (const value of stream) {
        const keyFacts = value.keyFacts;
        const bigPicture = value.bigPicture;

        if (!keyFacts) continue;

        yield {
            keyFacts,
            bigPicture,
        };
    }
}
