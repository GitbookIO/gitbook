import type { RenderIntegrationUI } from '@gitbook/api';

import type { GitBookBaseContext } from '@/lib/context';
import { ignoreDataFetcherErrors } from '@/lib/data';

/**
 * Render an integration UI while ignoring some errors.
 */
export async function fetchSafeIntegrationUI(
    context: GitBookBaseContext,
    {
        integrationName,
        request,
        allowFailedDependency = false,
    }: {
        integrationName: string;
        request: RenderIntegrationUI;
        allowFailedDependency?: boolean;
    }
) {
    const output = await ignoreDataFetcherErrors(
        context.dataFetcher.renderIntegrationUi({
            integrationName,
            request,
        }),

        // The API can respond with certain errors that are expected to happen.
        [
            404, // Integration has been uninstalled
            400, // Integration is rejecting its own request
            422, // Integration is triggering an invalid request, failing at the validation step
            ...(allowFailedDependency ? [424] : []),
            502, // Integration is failing in an unexpected way
        ]
    );

    return output;
}
