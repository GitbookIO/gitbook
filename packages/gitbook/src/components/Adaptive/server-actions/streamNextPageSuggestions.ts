'use server';
import { resolvePageId } from '@/lib/pages';
import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import { AIMessageRole } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@v2/lib/server-actions';
import { z } from 'zod';
import { streamGenerateObject } from './api';

/**
 * Get a list of pages to read next
 */
export async function* streamNextPageSuggestions({
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
    visitedPages?: Array<{ spaceId: string; pageId: string }>;
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
                    pages: z
                        .array(z.string().describe('The IDs of the page to read next.'))
                        .min(5)
                        .max(5),
                }),
                tools: {
                    getPages: true,
                    getPageContent: true,
                },
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content:
                            "You are a knowledge navigator. Given the user's visited pages and the documentation's table of contents, suggest a list of pages to read next.",
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: `The user is in space (ID ${currentSpace.id})`,
                    },
                    //                     {
                    //                         role: AIMessageRole.Developer,
                    //                         content: `Other spaces in the documentation are: ${allSpaces
                    //                             .map(
                    //                                 (space) => `
                    // - "${space.title}" (ID ${space.id})`
                    //                             )
                    //                             .join('\n')}

                    // Feel free to create journeys across spaces.`,
                    //                     },
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

    const emitted = new Set<string>();
    for await (const value of stream) {
        const pages = value.pages;

        if (!pages) continue;

        for (const pageId of pages) {
            if (!pageId) continue;
            if (emitted.has(pageId)) continue;

            emitted.add(pageId);

            const resolvedPage = resolvePageId(context.pages, pageId);
            if (!resolvedPage) continue;

            yield {
                id: resolvedPage.page.id,
                title: resolvedPage.page.title,
                icon: resolvedPage.page.icon,
                emoji: resolvedPage.page.emoji,
                href: context.linker.toPathForPage({
                    pages: context.pages,
                    page: resolvedPage.page,
                }),
            };
        }
    }
}
