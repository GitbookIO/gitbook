import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    const result = await throwIfDataError(getMarkdownForPage(context, pagePath));

    return new Response(result, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
