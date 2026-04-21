import type { GitBookSiteContext } from '@/lib/context';
import { getExposableError } from '@/lib/data';
import { linkerWithMarkdownPages } from '@/lib/links';
import { getMarkdownForPage } from '@/lib/markdownPage';
import {
    type ResolvedPagePath,
    getSimilarPages,
    resolvePagePathDocumentOrGroup,
} from '@/lib/pages';
import type { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

/**
 * Serve a markdown version of a page.
 * Returns a 404 if the page is not found.
 */
export async function servePageMarkdown(baseContext: GitBookSiteContext, pagePath: string) {
    return serveMarkdown(async () => {
        const context = {
            ...baseContext,
            linker: linkerWithMarkdownPages(baseContext.linker),
        };

        const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);
        if (!pageLookup) {
            // Generates a markdown body for missing pages. Return this with a 200 status (not 404) because agents discard 404 response bodies.=
            return renderNotFoundMarkdown(context, pagePath);
        }

        const markdownPage = await getMarkdownForPage(context, pageLookup);
        return `${markdownPage}${renderAskFooter(context, pageLookup)}`;
    });
}

function renderNotFoundMarkdown(context: GitBookSiteContext, pagePath: string) {
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

1. **Ask a question**: ${context.linker.toPathInSite('sitemap.md')}?ask=<question> - Complete answer with sources
2. **Browse the full index**: [${context.linker.toPathInSite('sitemap.md')}](${sitemapUrl}) - Complete documentation index
3. **View the full content**: [${context.linker.toPathInSite('llms-full.txt')}](${fullContentUrl}) - Full content export

## Tips for requesting documentation

- For markdown responses, append \`.md\` to URLs (e.g., \`${context.linker.toPathInSpace(similarPages[0]?.path ?? 'docs/example')}.md\`)
- Use \`Accept: text/markdown\` header for content negotiation`;
}

function renderAskFooter(
    context: GitBookSiteContext,
    pageLookup: ResolvedPagePath<RevisionPageDocument | RevisionPageGroup>
) {
    if (context.site.id !== 'site_p4Xo4') {
        return '';
    }

    return `\n\n---\n\n# Ask questions about the documentation

Tips: If you are looking for an information in the documentation, you can find it by asking a question directly via GET and the \`${context.linker.toAbsoluteURL(
        context.linker.toPathForPage({
            page: pageLookup.page,
            pages: context.revision.pages,
        })
    )}?ask=<question>\`.
`;
}

/**
 * Return a markdown content.
 */
export async function serveMarkdown(fn: () => Promise<string>) {
    try {
        const markdown = await fn();
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
