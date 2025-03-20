'use server';

import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import type { RenderIntegrationUI } from '@gitbook/api';
import { ContentKitOutput } from '@gitbook/react-contentkit';
import { throwIfDataError } from '@v2/lib/data';
import { getServerActionBaseContext } from '@v2/lib/server-actions';
import { contentKitServerContext } from './contentkit';

/**
 * Server action to render an integration UI request from <ContentKit />.
 * See `render` prop in <ContentKit /> for more details.
 */
export async function renderIntegrationUi({
    renderContext,
    request,
}: {
    renderContext: {
        integrationName: string;
    };
    request: RenderIntegrationUI;
}) {
    const serverAction = isV2() ? await getServerActionBaseContext() : await getV1BaseContext();

    const output = await throwIfDataError(
        serverAction.dataFetcher.renderIntegrationUi({
            integrationName: renderContext.integrationName,
            request,
        })
    );

    return {
        children: <ContentKitOutput output={output} context={contentKitServerContext} />,
        output: output,
    };
}
