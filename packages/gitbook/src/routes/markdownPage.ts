import { SiteInsightsDisplayContext } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { getDataOrNull } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(
    context: GitBookSiteContext,
    pagePath: string,
    request: Request
) {
    try {
        const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);

        waitUntil(
            trackServerInsightsEvents({
                organizationId: context.organizationId,
                siteId: context.site.id,
                events: [
                    {
                        type: 'page_view',
                        location: {
                            displayContext: SiteInsightsDisplayContext.Mcp,
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

        const result = await getDataOrNull(getMarkdownForPage(context, pagePath));
        if (!result) {
            return new Response('Page not found', {
                status: 404,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                },
            });
        }

        return new Response(result, {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'X-Robots-Tag': 'noindex',
            },
        });
    } catch (error) {
        console.error('Error serving markdown page:', error);
        return new Response('Internal Server Error', {
            status: 500,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }
}
