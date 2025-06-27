import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { getMarkdownForPagesTree } from '@/routes/llms';
import { type RevisionPageDocument, type RevisionPageGroup, RevisionPageType } from '@gitbook/api';
import type { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { gfmFromMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { gfm } from 'micromark-extension-gfm';
import { remove } from 'unist-util-remove';

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
    if (isEmptyPage(markdown) && page.pages.length > 0) {
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
function isEmptyPage(pageMarkdown: string): boolean {
    const trimmedMarkdown = pageMarkdown.trim();

    // Check if the markdown is empty
    if (!trimmedMarkdown) {
        return true;
    }

    // Parse the markdown to check if it only contains a title

    const tree = fromMarkdown(pageMarkdown, {
        extensions: [frontmatter(['yaml']), gfm()],
        mdastExtensions: [frontmatterFromMarkdown(['yaml']), gfmFromMarkdown()],
    });

    // Remove frontmatter
    remove(tree, 'yaml');

    // If the page has no content or only a title, it is empty
    return tree.children.length <= 1 && tree.children[0]?.type === 'heading';
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
