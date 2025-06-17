import type { RenderIntegrationUI } from '@gitbook/api';
import type { GitBookBaseContext } from '@v2/lib/context';
import { ignoreDataFetcherErrors } from '@v2/lib/data';

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

        // The API can respond with a 400 error if the integration is not installed
        // and 404 if the integration is not found.
        // The API can also respond with a 502 error if the integration is not generating a proper response.
        [404, 400, 502]
    );

    return output;
}
