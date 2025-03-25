'use server';

import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import { AIMessageRole } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { z } from 'zod';
import { streamGenerateObject } from './api';

/**
 * Get a list of questions that are recommended to be asked on a page.
 */
export async function* streamPageRecommendedQuestions({
    spaceId,
    revisionId,
    pageId,
}: {
    spaceId: string;
    revisionId: string;
    pageId: string;
}) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const { stream } = await streamGenerateObject(
        baseContext,
        {
            organizationId: siteURLData.organization,
            siteId: siteURLData.site,
        },
        {
            schema: z.object({
                questions: z.array(z.string()).max(5),
            }),
            messages: [
                {
                    role: AIMessageRole.Developer,
                    content:
                        'You are an AI to help users navigate and get the most out of the documentation. Based on the content of the page, generate a list of questions that are relevant to ask after reading the page.',
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
                {
                    role: AIMessageRole.User,
                    content: 'Content of the current page:',
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
    );

    const emitted = new Set<string>();
    for await (const value of stream) {
        const questions = value.questions;
        if (!questions) {
            continue;
        }

        for (const question of questions) {
            if (!question) {
                continue;
            }

            if (emitted.has(question)) {
                continue;
            }

            emitted.add(question);
            yield question;
        }
    }
}
