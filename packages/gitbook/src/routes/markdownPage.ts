import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { isNodeEmpty } from '@/lib/document';
import { getPagesTree, resolvePagePath } from '@/lib/pages';
import { getIndexablePages } from '@/lib/sitemap';
import { type RevisionPageDocument, type RevisionPageGroup, RevisionPageType } from '@gitbook/api';
import type { Root } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';

/**
 * Generate a markdown version of a page.
 * Handles both regular document pages and group pages (pages with child pages).
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    const pageLookup = resolvePagePath(context.revision.pages, pagePath, {
        includePageGroup: true,
    });

    if (!pageLookup) {
        return new Response(`Page "${pagePath}" not found`, { status: 404 });
    }

    const { page } = pageLookup;

    // Only handle documents and groups
    if (page.type !== RevisionPageType.Document && page.type !== RevisionPageType.Group) {
        return new Response(`Page "${pagePath}" is not a document or group`, { status: 404 });
    }

    // Handle group pages and empty document pages with children
    const isGroupPage = await shouldTreatAsGroupPage(context, page);
    if (isGroupPage) {
        return servePageGroup(context, page);
    }

    // Handle regular document pages
    const markdown = await throwIfDataError(
        context.dataFetcher.getRevisionPageMarkdown({
            spaceId: context.space.id,
            revisionId: context.revision.id,
            pageId: page.id,
        })
    );

    return new Response(markdown, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}

/**
 * Determine if a page should be treated as a group page.
 * A page is treated as a group if:
 * 1. It's explicitly a group page type, OR
 * 2. It's a document page but has empty content (acts as a container)
 */
async function shouldTreatAsGroupPage(
    context: GitBookSiteContext,
    page: RevisionPageDocument | RevisionPageGroup
): Promise<boolean> {
    if (page.type === RevisionPageType.Group) {
        return true;
    }

    const document = await throwIfDataError(
        context.dataFetcher.getRevisionPageDocument({
            spaceId: context.space.id,
            revisionId: context.revision.id,
            pageId: page.id,
        })
    );

    return isNodeEmpty(document);
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

    const markdownTree: Root = {
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: page.title }],
            },
            ...(await getPagesTree(indexablePages, {
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
