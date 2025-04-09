'use server';
import { type AncestorRevisionPage, resolvePageId } from '@/lib/pages';
import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import { AIMessageRole, type RevisionPageDocument } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@v2/lib/server-actions';
import { z } from 'zod';
import { streamGenerateObject } from './api';

/**
 * Get a summary of a page, in the context of another page
 */
export async function* streamPageJourneySuggestions({
    currentPage,
    currentSpace,
    allSpaces,
    visitedPages,
    count,
}: {
    currentPage: {
        id: string;
        title: string;
    };
    currentSpace: {
        id: string;
        // title: string;
    };
    allSpaces: {
        id: string;
        title: string;
    }[];
    visitedPages?: Array<{ spaceId: string; pageId: string }>;
    count: number;
}) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const [{ stream }, context] = await Promise.all([
        streamGenerateObject(
            baseContext,
            {
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
            },
            {
                schema: z.object({
                    journeys: z
                        .array(
                            z.object({
                                label: z.string().describe('The label of the journey.'),
                                icon: z
                                    .string()
                                    .describe(
                                        'The icon of the journey. Use an icon from FontAwesome, stripping the `fa-`. Examples: rocket-launch, tennis-ball, cat'
                                    ),
                                pages: z
                                    .array(
                                        z.object({
                                            id: z.string(),
                                        })
                                    )
                                    .describe(
                                        'A list of pages in the journey, excluding the current page. Try to avoid duplicate content that is very similar.'
                                    )
                                    .min(5)
                                    .max(10),
                            })
                        )
                        .describe('The possible journeys to take through the documentation.')
                        .min(count)
                        .max(count),
                }),
                tools: {
                    getPages: true,
                    getPageContent: true,
                },
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content:
                            "You are a knowledge navigator. Given the user's visited pages and the documentation's table of contents, suggest a named journey through the documentation. A journey is a list of pages that are related to each other. A journey's label starts with a verb and has a clear subject. Use sentence case (so only capitalize the first letter of the first word). Be concise and use short words to fit in the label. For example, use 'docs' instead of 'documentation'. Try to pick out specific journeys, not too generic.",
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `The user is in space "${allSpaces.find((space) => space.id === currentSpace.id)?.title}" (ID ${currentSpace.id})`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `Other spaces in the documentation are: ${allSpaces
                            .map(
                                (space) => `
- "${space.title}" (ID ${space.id})`
                            )
                            .join('\n')}

Feel free to create journeys across spaces.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `The current page is: "${currentPage.title}" (ID ${currentPage.id}). You can use the getPageContent tool to get the content of any relevant links to include in the journey. Only follow links to pages.`,
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
                                  content: `The user's visited pages are: ${visitedPages.map((page) => page.pageId).join(', ')}. The content of the last 5 pages are included below.`,
                                  attachments: visitedPages.slice(0, 5).map((page) => ({
                                      type: 'page' as const,
                                      spaceId: page.spaceId,
                                      pageId: page.pageId,
                                  })),
                              },
                          ]
                        : []),
                ],
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    const emitted: { label: string; pageIds: string[] }[] = [];
    const allEmittedPageIds = new Set<string>();

    for await (const value of stream) {
        const journeys = value.journeys;

        if (!journeys) continue;

        for (const journey of journeys) {
            if (!journey?.label) continue;
            if (!journey?.pages || journey.pages?.length === 0) continue;
            if (emitted.find((item) => item.label === journey.label)) continue;

            const pageIds: string[] = [];
            const resolvedPages: {
                page: RevisionPageDocument;
                ancestors: AncestorRevisionPage[];
            }[] = [];
            for (const page of journey.pages) {
                if (!page) continue;
                if (!page.id) continue;
                if (pageIds.includes(page.id)) continue;

                pageIds.push(page.id);

                const resolvedPage = resolvePageId(context.pages, page.id);
                if (!resolvedPage) continue;

                resolvedPages.push(resolvedPage);
            }

            emitted.push({
                label: journey.label,
                pageIds: pageIds,
            });

            // Deduplicate pages before yielding
            const uniquePages = resolvedPages.filter(page => {
                if (allEmittedPageIds.has(page.page.id)) {
                    return false;
                }
                allEmittedPageIds.add(page.page.id);
                return true;
            });

            yield {
                label: journey.label,
                icon: journey.icon,
                pages: uniquePages.map((page) => ({
                    id: page.page.id,
                    title: page.page.title,
                    icon: page.page.icon,
                    emoji: page.page.emoji,
                    href: context.linker.toPathForPage({
                        pages: context.pages,
                        page: page.page,
                    }),
                })),
            };
        }
    }
}
