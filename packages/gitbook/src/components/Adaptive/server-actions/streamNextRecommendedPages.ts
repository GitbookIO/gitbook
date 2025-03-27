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
 * Get a list of pages that are recommended to be read next.
 */
export async function* streamNextRecommendedPages({
    spaceId,
    revisionId,
    previousPageIds,
    pageId,
}: {
    spaceId: string;
    revisionId: string;
    previousPageIds: string[];
    pageId: string;
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
                    pages: z.array(z.string().describe('The id of the page')).max(5),
                }),
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content:
                            'You are an AI to help users navigate and get the most out of the documentation. Using the table of contents and a list of pages that the user has visited, generate a list of pages that are relevant to read next.',
                    },
                    {
                        role: AIMessageRole.User,
                        content: 'Pages in the documentation:',
                        attachments: [
                            {
                                type: 'pages',
                                spaceId,
                                revisionId,
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
                        content: `The user is currently on the page "${pageId}", the content of the page is:`,
                        attachments: [
                            {
                                type: 'page',
                                spaceId,
                                revisionId,
                                pageId,
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
        const pages = value.pages;
        if (!pages) {
            continue;
        }

        for (const pageId of pages) {
            if (!pageId) {
                continue;
            }

            if (emitted.has(pageId)) {
                continue;
            }

            emitted.add(pageId);

            const page = resolvePageId(context.pages, pageId);
            if (!page) {
                continue;
            }

            yield {
                title: page.page.title,
                href: context.linker.toPathForPage({
                    pages: context.pages,
                    page: page.page,
                }),
            };
        }
    }
}
