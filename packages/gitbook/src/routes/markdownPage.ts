import type { GitBookSiteContext } from '@/lib/context';
import { getExposableError } from '@/lib/data';
import { linkerWithMarkdownPages } from '@/lib/links';
import { getMarkdownForPage } from '@/lib/markdownPage';
import {
    type ResolvedPagePath,
    getSimilarPages,
    resolvePagePathDocumentOrGroup,
} from '@/lib/pages';
import { isRollout } from '@/lib/rollout';
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

The URL \`${pagePath}\` does not exist. This page may have been moved, renamed, or deleted.

## Suggested Pages

You may be looking for one of the following:
${similarPages.map((page) => `- [${page.title}](${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md)`).join('\n')}

## How to find the correct page

If the exact page cannot be found, you can still retrieve the information using the documentation query interface.

### Option 1 — Ask a question (recommended)

Perform an HTTP GET request on the documentation index with the \`ask\` parameter:

\`\`\`
GET ${context.linker.toAbsoluteURL(
        context.linker.toPathForPagePath({
            path: similarPages[0]?.path ?? 'docs/example',
        })
    )}?ask=<question>
\`\`\`

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

### Option 2 — Browse the documentation index

Full index: ${sitemapUrl}

Use this to discover valid page paths or navigate the documentation structure.

### Option 3 — Retrieve the full documentation corpus

Full export: ${fullContentUrl}

Use this to access all content at once and perform your own parsing or retrieval. It will be more expensive.

## Tips for requesting documentation

Prefer \`.md\` URLs for structured content, append \`.md\` to URLs (e.g., \`${context.linker.toPathForPagePath(
        {
            path: similarPages[0]?.path ?? 'docs/example',
        }
    )}\`).

You may also use \`Accept: text/markdown\` header for content negotiation.
`;
}

function renderAskFooter(
    context: GitBookSiteContext,
    pageLookup: ResolvedPagePath<RevisionPageDocument | RevisionPageGroup>
) {
    if (
        !isRollout({
            discriminator: context.site.id,
            percentageRollout: 25,
        }) &&
        context.site.id !== 'site_p4Xo4'
    ) {
        return '';
    }

    return `\n\n---\n\n# Agent Instructions: Querying This Documentation

If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

Perform an HTTP GET request on the current page URL with the \`ask\` query parameter:

\`\`\`
GET ${context.linker.toAbsoluteURL(
        context.linker.toPathForPage({
            page: pageLookup.page,
            pages: context.revision.pages,
        })
    )}?ask=<question>
\`\`\`

The question should be specific, self-contained, and written in natural language.
The response will contain a direct answer to the question and relevant excerpts and sources from the documentation.

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
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
