import { SiteInsightsDisplayContext } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { DataFetcherError, getExposableError } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(
    request: Request,
    context: GitBookSiteContext,
    pagePath: string
) {
    try {
        const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);
        if (!pageLookup) {
            throw new DataFetcherError(`Page "${pagePath}" not found`, 404);
        }

        waitUntil(
            trackServerInsightsEvents({
                organizationId: context.organizationId,
                siteId: context.site.id,
                events: [
                    {
                        type: 'page_markdown_request',
                        location: {
                            displayContext: SiteInsightsDisplayContext.Server,
                            ...(pageLookup
                                ? {
                                      page: pageLookup.page.id,
                                      space: context.space.id,
                                  }
                                : {}),
                        },
                    },
                ],
                request,
            })
        );

        const markdown = await getMarkdownForPage(context, pageLookup);

        return new Response(markdown, {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'X-Robots-Tag': 'noindex',
            },
        });
    } catch (error) {
        const exposable = getExposableError(error);
        return new Response(exposable.message, {
            status: exposable.code,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }
}
