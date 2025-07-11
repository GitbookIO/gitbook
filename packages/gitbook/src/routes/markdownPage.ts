import type { GitBookSiteContext } from '@/lib/context';
import { getDataOrNull } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    try {
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
