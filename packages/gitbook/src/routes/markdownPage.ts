import type { GitBookSiteContext } from '@/lib/context';
import { getExposableError } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { generateNotFoundMarkdown } from '@vercel/agent-readability';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    try {
        const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);
        if (!pageLookup) {
            // Generates a markdown body for missing pages. Return this with a 200 status (not 404) because agents discard 404 response bodies.

            const md = generateNotFoundMarkdown(pagePath, {
                baseUrl: context.linker.toAbsoluteURL(context.linker.toPathInSpace('')),
            });
            // Return as 200 so agents read the body
            return serveMarkdown(md);
        }

        const markdown = await getMarkdownForPage(context, pageLookup);
        return serveMarkdown(markdown);
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

function serveMarkdown(markdown: string) {
    return new Response(markdown, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Robots-Tag': 'noindex',
        },
    });
}
