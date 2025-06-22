'use server';
import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import { AIMessageRole, AIModel } from '@gitbook/api';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { streamGenerateDocument } from './api';

const PROMPT = `
You are a helpful assistant that can answer questions about the content of the site.
`;

export async function* streamAsk({
    query,
    previousResponseId,
}: {
    query: string;
    previousResponseId?: string;
}) {
    const baseContext = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const { response, stream } = await streamGenerateDocument(baseContext, {
        organizationId: siteURLData.organization,
        siteId: siteURLData.site,
        model: AIModel.Fast,
        instructions: PROMPT,
        previousResponseId,
        input: [
            {
                role: AIMessageRole.User,
                content: query,
            },
        ],
    });

    for await (const output of stream) {
        yield { output };
    }

    // Wait for the responseId to be available and yield one final time
    const { responseId } = await response;
    yield { responseId };
}
