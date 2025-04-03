'use server';
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
export async function* streamPageTopics({
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
                    topics: z
                        .array(
                            z.object({
                                name: z.string().describe('The recommended topic name'),
                                icon: z
                                    .string()
                                    .describe(
                                        'A fontawesome icon name to describe the topic, without the `fa-` part.'
                                    ),
                            })
                        )
                        .max(4),
                }),
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content: `
# Task
You are a documentation navigator, tasked with helping the user navigate through documentation.
The user is currently reading a page, and is considering next pages to navigate to.
Gather topics present in the documentation, and present the relevant topics to the user given their existing page and context. These topics will inform next pages to visit.
Topics always contain a verb and a subject. Use sentence case (capitalise first word only).
`,
                    },
                    {
                        role: AIMessageRole.User,
                        content: 'Pages in the documentation:',
                        attachments: [
                            {
                                type: 'pages',
                                spaceId,
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
                                pageId,
                            },
                        ],
                    },
                ],
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    // const emitted = new Set<{ id: string, name?: string; icon?: string }>();
    for await (const value of stream) {
        const topics = value.topics;
        if (!topics) {
            continue;
        }

        // for (const topic of topics) {
        //     if (!topic) {
        //         continue;
        //     }

        //     // const page = resolvePageId(context.pages, pageId);
        //     if (!topic.name || !topic.icon) {
        //         continue;
        //     }

        //     emitted.has(topic)
        //     yield {
        //         name: topic.name,
        //         icon: topic.icon,
        //     };
        // }
        yield topics;
    }
}
