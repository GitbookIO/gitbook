import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { getMarkdownForPagesTree } from '@/routes/llms';
import { type RevisionPageDocument, type RevisionPageGroup, RevisionPageType } from '@gitbook/api';
import type { Root } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

/**
 * Generate a markdown version of a page.
 * Handles both regular document pages and group pages (pages with child pages).
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);

    if (!pageLookup) {
        return new Response(`Page "${pagePath}" not found`, { status: 404 });
    }

    const { page } = pageLookup;

    // Only handle documents and groups
    if (page.type !== RevisionPageType.Document && page.type !== RevisionPageType.Group) {
        return new Response(`Page "${pagePath}" is not a document or group`, { status: 404 });
    }

    // Handle group pages
    if (page.type === RevisionPageType.Group) {
        return servePageGroup(context, page);
    }

    const markdown = await throwIfDataError(
        context.dataFetcher.getRevisionPageMarkdown({
            spaceId: context.space.id,
            revisionId: context.revision.id,
            pageId: page.id,
        })
    );

    // Handle empty document pages which have children
    if (isEmptyMarkdownPage(markdown) && page.pages.length > 0) {
        return servePageGroup(context, page);
    }

    return new Response(markdown, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}

/**
 * Determine if a page is empty.
 * A page is empty if it has no content or only a title.
 */
function isEmptyMarkdownPage(markdown: string): boolean {
    // Remove frontmatter
    const stripped = markdown
        .trim()
        .replace(/^---\n[\s\S]*?\n---\n?/g, '')
        .trim();

    // Fast path: try to quickly detect obvious matches
    if (/^[ \t]*# .+$/m.test(stripped)) {
        // If there's a single heading line or empty lines, and no other content
        return (
            /^#{1,6} .+\s*$/.test(stripped) &&
            !/\n\S+/g.test(stripped.split('\n').slice(1).join('\n'))
        );
    }

    // Fallback: parse with remark for safety
    const tree = unified().use(remarkParse).parse(stripped) as Root;

    let seenHeading = false;

    for (const node of tree.children) {
        if (node.type === 'heading') {
            if (seenHeading) {
                return false;
            }
            seenHeading = true;
            continue;
        }

        // Allow empty whitespace-only text nodes (e.g., extra newlines)
        if (
            node.type === 'paragraph' &&
            node.children.length === 1 &&
            node.children[0].type === 'text' &&
            !node.children[0].value.trim()
        ) {
            continue;
        }

        // Anything else is disallowed
        return false;
    }

    return seenHeading;
}

/**
 * Generate markdown for a group page by creating a page listing.
 * Creates a markdown document with the page title as heading and a list of child pages.
 */
async function servePageGroup(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
) {
    const siteSpaceUrl = context.space.urls.published;
    if (!siteSpaceUrl) {
        return new Response(`Page "${page.title}" is not published`, { status: 404 });
    }

    const indexablePages = getIndexablePages(page.pages);

    // Create a markdown tree with the page title as heading and a list of child pages
    const markdownTree: Root = {
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: page.title }],
            },
            ...(await getMarkdownForPagesTree(indexablePages, {
                siteSpaceUrl,
                linker: context.linker,
                withMarkdownPages: true,
            })),
        ],
    };

    return new Response(
        toMarkdown(markdownTree, {
            bullet: '-',
        }),
        {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
            },
        }
    );
}
