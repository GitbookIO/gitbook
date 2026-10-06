import type { RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { resolveMissingPagePath } from '@/components/SitePage/fetch';
import { isAIEnabled } from '@/components/utils/isAIChatEnabled';
import { renderQueryingDocumentation } from '@/lib/ask-prompt';
import type { GitBookSiteContext } from '@/lib/context';
import { getExposableError } from '@/lib/data';
import { linkerWithMarkdownPages } from '@/lib/links';
import { renderLLMsTxtMarkdownDirective } from '@/lib/llms-directive';
import { getMarkdownContentType } from '@/lib/markdown-content-type';
import { getMarkdownForPage } from '@/lib/markdownPage';
import { type ResolvedPagePath, getSimilarPages } from '@/lib/pages';
import { isPageIndexable, isSiteIndexable } from '@/lib/seo';
import { resolveSiteSpacePagePathDocumentOrGroup } from '@/lib/sites';

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

        const pageLookup =
            resolveSiteSpacePagePathDocumentOrGroup(
                context.siteSpace,
                context.revision.pages,
                pagePath
            ) ??
            // Page paths are lowercase, match the case-insensitive lookup of HTML pages.
            resolveSiteSpacePagePathDocumentOrGroup(
                context.siteSpace,
                context.revision.pages,
                pagePath.toLowerCase()
            );
        if (!pageLookup) {
            const fallback = await resolveMissingPagePath(baseContext, pagePath);
            if (fallback?.type === 'redirect') {
                return markdownRedirect(
                    toMarkdownDestination(fallback.destination),
                    fallback.permanent
                );
            }
            if (fallback?.type === 'page') {
                return markdownRedirect(
                    context.linker.toPathForPage({
                        pages: context.revision.pages,
                        page: fallback.page.page,
                    }),
                    false
                );
            }

            // Generates a markdown body for missing pages. Return this with a 200 status (not 404) because agents discard 404 response bodies.=
            return {
                markdown: renderNotFoundMarkdown(context, pagePath),
                robots: 'noindex, nofollow',
            };
        }

        const robots = getMarkdownRobots(context, pageLookup);

        const markdownPage = await getMarkdownForPage(context, pageLookup);
        if (baseContext.displayAgentInstructions === false) {
            return { markdown: markdownPage, robots };
        }
        return {
            markdown: `${renderLLMsTxtMarkdownDirective(context, pageLookup.page)}\n\n${markdownPage}${renderAskFooter(context, pageLookup)}`,
            robots,
        };
    }, baseContext.isChatGPT);
}

/**
 * Robots directive for a markdown page: the markdown version is only indexable for AI agents,
 * and only when the page itself is indexable.
 */
function getMarkdownRobots(
    context: GitBookSiteContext,
    pageLookup: ResolvedPagePath<RevisionPageDocument | RevisionPageGroup>
) {
    if (!isSiteIndexable(context) || !isPageIndexable(pageLookup.ancestors, pageLookup.page)) {
        return 'noindex, nofollow';
    }

    return context.isAiAgent ? 'index, follow' : 'noindex';
}

/**
 * Point a redirect destination to its markdown version, so agents keep receiving markdown.
 * Destinations outside the site are returned as full URLs and left untouched.
 */
export function toMarkdownDestination(destination: string): string {
    if (!destination.startsWith('/')) {
        return destination;
    }

    const url = new URL(destination, 'https://gitbook.invalid');
    const pathname = url.pathname.replace(/\/+$/, '');
    if (pathname.endsWith('.md')) {
        return destination;
    }

    // A root destination trims to an empty pathname; its markdown route is `/.md`.
    return `${pathname || '/'}.md${url.search}${url.hash}`;
}

function markdownRedirect(location: string, permanent: boolean) {
    // Same status codes as Next's `redirect` / `permanentRedirect`.
    return new Response(null, {
        status: permanent ? 308 : 307,
        headers: { Location: location, Vary: 'Accept' },
    });
}

function renderNotFoundMarkdown(context: GitBookSiteContext, pagePath: string) {
    const similarPages = getSimilarPages(context.revision.pages, pagePath, 5);
    const sitemapUrl = context.linker.toAbsoluteURL(context.linker.toPathInSite('sitemap.md'));
    const fullContentUrl = context.linker.toAbsoluteURL(
        context.linker.toPathInSite('llms-full.txt')
    );
    const askPageUrl = context.linker.toAbsoluteURL(
        context.linker.toPathForPagePath({
            path: similarPages[0]?.path ?? 'docs/example',
        })
    );

    return `# Page Not Found

The URL \`${pagePath}\` does not exist. This page may have been moved, renamed, or deleted.

## Suggested Pages

You may be looking for one of the following:
${similarPages.map((page) => `- [${page.title}](${context.linker.toAbsoluteURL(context.linker.toPathInSpace(page.path))}.md)`).join('\n')}

## How to find the correct page

If the exact page cannot be found, you can still retrieve the information using the documentation query interface.

### Option 1 — Ask a question (recommended)

${renderQueryingDocumentation({ pageUrl: askPageUrl })}

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
    if (!isAIEnabled(context.customization.ai.mode)) {
        return '';
    }

    const pageUrl = context.linker.toAbsoluteURL(
        context.linker.toPathForPage({
            page: pageLookup.page,
            pages: context.revision.pages,
        })
    );

    return `\n\n---\n\n# Agent Instructions
This documentation is published with GitBook. GitBook is the documentation platform designed so that both humans and AI agents can read, navigate, and reason over technical content effectively. Learn more at gitbook.com.

## Querying This Documentation
If you need additional information that is not directly available in this page, you can query the documentation dynamically by asking a question.

${renderQueryingDocumentation({ pageUrl })}

Use this mechanism when the answer is not explicitly present in the current page, you need clarification or additional context, or you want to retrieve related documentation sections.
`;
}

/**
 * Return a markdown content.
 */
export async function serveMarkdown(
    fn: () => Promise<string | { markdown: string; robots: string } | Response>,
    isChatGPT?: boolean
) {
    try {
        const result = await fn();
        if (result instanceof Response) {
            return result;
        }
        const { markdown, robots } =
            typeof result === 'string' ? { markdown: result, robots: 'noindex' } : result;
        return new Response(markdown, {
            headers: {
                'Content-Type': getMarkdownContentType(isChatGPT),
                'X-Robots-Tag': robots,
                Vary: 'Accept',
            },
        });
    } catch (error) {
        const exposable = getExposableError(error);
        return new Response(exposable.message, {
            status: exposable.code,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                Vary: 'Accept',
            },
        });
    }
}
