import type { GitBookSiteContext } from '@/lib/context';
import { DataFetcherError, getExposableError } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    try {
        const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);
        if (!pageLookup) {
            throw new DataFetcherError(`Page "${pagePath}" not found`, 404);
        }

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
