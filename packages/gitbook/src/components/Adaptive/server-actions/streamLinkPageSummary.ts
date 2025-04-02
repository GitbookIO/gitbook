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
    previousPageIds,
}: {
    currentSpaceId: string;
    currentPageId: string;
    targetSpaceId: string;
    targetPageId: string;
    previousPageIds: string[];
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
                    summary: z.array(z.string().describe('The summary of the target page')),
                    // questions: z.array(z.string().describe('The questions to sea')).max(3),
                }),
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content: `You are a documentation navigator, tasked with generating summaries of articles the user might navigate to next.
                        Given a user's current article and the target article the user is inspecting, respond with a one-sentence summary of the target article. Make sure to tailor the summary to the user's current article, for example by examining the paragraph the link to the target article is mentioned in.
                        Do not repeat the article's title and description, because these are already shown to the user. Avoid the passive voice, and don't reference the article itself.`,
                    },
                    {
                        role: AIMessageRole.Developer,
                        content: 'Pages in the documentation:',
                        attachments: [
                            {
                                type: 'pages',
                                spaceId: currentSpaceId,
                            },
                        ],
                    },
                    ...(previousPageIds.length > 0
                        ? [
                              {
                                  role: AIMessageRole.User,
                                  content: `The user has visited the following pages: ${previousPageIds.join(', ')}`,
                              },
                          ]
                        : []),
                    {
                        role: AIMessageRole.User,
                        content: `The user is currently on page ID ${currentPageId}, the content of the page is:`,
                        attachments: [
                            {
                                type: 'page',
                                spaceId: currentSpaceId,
                                pageId: currentPageId,
                            },
                        ],
                    },
                    {
                        role: AIMessageRole.User,
                        content: `The user is looking at page ID ${targetPageId}, the content of the page is:`,
                        attachments: [
                            {
                                type: 'page',
                                spaceId: targetSpaceId,
                                pageId: targetPageId,
                            },
                        ],
                    },
                ],
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    const emitted = new Set<string>();
    for await (const value of stream) {
        const summary = value.summary;
        if (!summary) {
            continue;
        }

        yield summary;

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
