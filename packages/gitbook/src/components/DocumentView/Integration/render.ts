import type { GitBookBaseContext } from '@/lib/context';
import { ignoreDataFetcherErrors } from '@/lib/data';
import type { RenderIntegrationUI } from '@gitbook/api';

/**
 * Render an integration UI while ignoring some errors.
 */
export async function fetchSafeIntegrationUI(
    context: GitBookBaseContext,
    {
        integrationName,
        request,
    }: {
        integrationName: string;
        request: RenderIntegrationUI;
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
            502, // Integration is failing in an unexpected way
        ]
    );

    return output;
}
