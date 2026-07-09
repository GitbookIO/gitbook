'use server';

import { getPagePath, resolvePageId } from '@/lib/pages';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
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

/**
 * Server action to resolve a page (by its ID) to a path within the current site, in response to a
 * webframe `@webframe.navigate` action. Resolution is scoped to the current space's revision, so a
 * page in another section/space can only be reached by `path`. Returns `null` when the page is
 * unknown.
 */
export async function resolveWebframePagePath(pageId: string): Promise<string | null> {
    return traceErrorOnly('DocumentView.resolveWebframePagePath', async () => {
        const baseContext = await getServerActionBaseContext();
        const context = await fetchServerActionSiteContext(baseContext);

        const resolved = resolvePageId(context.revision.pages, pageId);
        if (!resolved) {
            return null;
        }

        return context.linker.toPathInSpace(getPagePath(context.revision.pages, resolved.page));
    });
}
