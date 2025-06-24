'use server';
import { getSiteURLDataFromMiddleware } from '@v2/lib/middleware';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
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
    const { dataFetcher } = await getServerActionBaseContext();
    const siteURLData = await getSiteURLDataFromMiddleware();

    const api = await dataFetcher.api();
    const rawStream = await api.orgs.streamExistingAiResponseInSite(
        siteURLData.organization,
        siteURLData.site,
        responseId
    );
    const { stream } = await streamRenderAIMessage(rawStream, options);

    for await (const output of stream) {
        yield output;
    }
}
