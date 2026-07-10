'use server';

import { getServerActionBaseContext } from '@/lib/server-actions';
import { traceErrorOnly } from '@/lib/tracing';
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
    return traceErrorOnly('DocumentView.renderIntegrationUi', async () => {
        const serverAction = await getServerActionBaseContext();
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
    });
}
