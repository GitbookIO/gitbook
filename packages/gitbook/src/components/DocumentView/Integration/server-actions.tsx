'use server';

import { getServerActionBaseContext } from '@/lib/server-actions';
import { getV1BaseContext } from '@/lib/v1';
import { isV2 } from '@/lib/v2';
import type { RenderIntegrationUI } from '@gitbook/api';
import { ContentKitOutput } from '@gitbook/react-contentkit';
import { contentKitServerContext } from './contentkit';
import { fetchSafeIntegrationUI } from './render';

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
    const output = await fetchSafeIntegrationUI(serverAction, {
        integrationName: renderContext.integrationName,
        request,
    });

    if (output.error) {
        return {
            error: output.error.message,
        };
    }

    return {
        children: <ContentKitOutput output={output.data} context={contentKitServerContext} />,
        output: output.data,
    };
}
