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
export async function* streamPageQuestion(question: string, responseId: string) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const [{ stream, response }] = await Promise.all([
        streamGenerateObject(
            baseContext,
            {
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
            },
            {
                schema: z.object({
                    answer: z.string().describe('The answer to the question'),
                }),
                previousResponseId: responseId,
                tools: {
                    search: true,
                    getPageContent: true,
                    getPages: true,
                },
                messages: [
                    {
                        role: AIMessageRole.Developer,
                        content:
                            'The user is asking a question about the page. Use your knowledge of the page and the context to answer the question. Be succinct in your answers, do not repeat information already in the key facts or big picture.',
                    },
                    {
                        role: AIMessageRole.Developer,
                        content:
                            'Use the tools available to you to find the answers (read page content, etc).',
                    },
                    {
                        role: AIMessageRole.User,
                        content: question,
                    },
                ],
            }
        ),
        fetchServerActionSiteContext(baseContext),
    ]);

    // Get the responseId asynchronously in the background
    let newResponseId: string | null = null;
    const responseIdPromise = response
        .then((r) => {
            newResponseId = r.responseId;
        })
        .catch((error) => {
            console.error('Error getting responseId:', error);
        });

    // Start processing the stream immediately
    for await (const value of stream) {
        if (!value.answer) continue;

        yield {
            answer: value.answer,
        };
    }

    // Wait for the responseId to be available and yield one final time
    await responseIdPromise;
    yield { newResponseId };
}
