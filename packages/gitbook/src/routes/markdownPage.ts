import type { GitBookSiteContext } from '@/lib/context';
import { getExposableError } from '@/lib/data';
import { getMarkdownForPage } from '@/lib/markdownPage';
import { getSimilarPages, resolvePagePathDocumentOrGroup } from '@/lib/pages';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    try {
        const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);
        if (!pageLookup) {
            // Generates a markdown body for missing pages. Return this with a 200 status (not 404) because agents discard 404 response bodies.
            const md = generateNotFoundMarkdown(context, pagePath);
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

function generateNotFoundMarkdown(context: GitBookSiteContext, pagePath: string) {
    const similarPages = getSimilarPages(context.revision.pages, pagePath, 5);
    const sitemapUrl = context.linker.toAbsoluteURL(context.linker.toPathInSite('sitemap.md'));
    const fullContentUrl = context.linker.toAbsoluteURL(
        context.linker.toPathInSite('llms-full.txt')
    );

    return `# Page Not Found

The URL \`${pagePath}\` does not exist.

You might be looking for one of these pages:
${similarPages.map((page) => `- [${page.title}](${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md)`).join('\n')}

## How to find the correct page

1. **Browse the full index**: [/sitemap.md](${sitemapUrl}) - Complete documentation index
2. **View the full content**: [/llms-full.txt](${fullContentUrl}) - Full content export

## Tips for requesting documentation

- For markdown responses, append \`.md\` to URLs (e.g., \`${context.linker.toPathInSpace(similarPages[0]?.path ?? 'docs/example')}.md\`)
- Use \`Accept: text/markdown\` header for content negotiation`;
}

function serveMarkdown(markdown: string) {
    return new Response(markdown, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'X-Robots-Tag': 'noindex',
        },
    });
}
