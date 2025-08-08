'use server';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';
import { streamRenderAIMessage } from './api';
import type { RenderAIMessageOptions } from './types';

/**
 * Stream an existing AI responses.
 */
export async function* streamAIResponseById({
    responseId,
    options,
}: {
    responseId: string;
    options?: RenderAIMessageOptions;
}) {
    const { stream } = await traceErrorOnly('AI.streamAIResponseById', async () => {
        const context = await getServerActionBaseContext();
        const siteURLData = await getSiteURLDataFromMiddleware();

        const api = await context.dataFetcher.api();
        const rawStream = api.orgs.streamExistingAiResponseInSite(
            siteURLData.organization,
            siteURLData.site,
            responseId
        );
        return await streamRenderAIMessage(context, rawStream, options);
    });

    for await (const output of stream) {
        yield output;
    }
}
