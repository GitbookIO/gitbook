import { getPageFullTitle } from '@/components/SitePage';
import type { GitBookSiteContext } from '@/lib/context';
import { getPageDocument } from '@/lib/data/pages';
import { getBlocksByType, getNodeText, isHeadingBlock } from '@/lib/document';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { joinPath } from '@/lib/paths';
import { type RevisionPageDocument, RevisionPageType } from '@gitbook/api';
import { Feed } from 'feed';

/**
 * Get the URL of a RSS feed for a page.
 */
export function getPageRSSURL(context: GitBookSiteContext, page: RevisionPageDocument): string {
    const pagePath = context.linker.toPathForPage({ pages: context.revision.pages, page });
    return context.linker.toAbsoluteURL(joinPath(pagePath, 'rss.xml'));
}

/**
 * Generate an RSS feed from Updates blocks in a page.
 */
export async function servePageRSS(
    context: GitBookSiteContext,
    inputPagePath: string
): Promise<Response | null> {
    const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, inputPagePath);

    if (!pageLookup) {
        return notFoundResponse('Page not found');
    }
    if (pageLookup.page.type !== RevisionPageType.Document) {
        return notFoundResponse('Page is not a document');
    }

    const { page } = pageLookup;
    const document = await getPageDocument(context, page);
    if (!document) {
        return notFoundResponse('Page is empty');
    }

    const updatesBlocks = getBlocksByType(document, 'updates');

    if (updatesBlocks.length === 0) {
        return notFoundResponse('No updates found in page');
    }

    // Get page URL
    const pagePath = context.linker.toPathForPage({ pages: context.revision.pages, page });
    const pageURL = context.linker.toAbsoluteURL(pagePath);
    const rssURL = getPageRSSURL(context, page);
    const docsURL = context.linker.toAbsoluteURL(context.linker.toPathInSite('/'));

    // Create RSS feed
    const feed = new Feed({
        id: page.id,
        title: getPageFullTitle(context, page),
        description: page.description || `Updates feed for ${page.title}`,
        link: pageURL,
        copyright: `Copyright ${new Date().getFullYear()}`,
        updated: new Date(page.updatedAt ?? page.createdAt ?? Date.now()),
        feedLinks: {
            rss: rssURL,
        },
        docs: docsURL,
    });

    updatesBlocks.forEach((updatesBlock) => {
        updatesBlock.nodes.forEach((update) => {
            const heading = update.nodes[0];
            if (!heading || !isHeadingBlock(heading)) {
                return;
            }

            const title = getNodeText(heading).trim();
            const anchorId = heading.meta?.id;
            const itemLink = anchorId ? `${pageURL}#${anchorId}` : pageURL;

            const contentNodes = update.nodes.slice(1);
            const content = contentNodes.map((node) => getNodeText(node)).join('\n\n');

            feed.addItem({
                title: title,
                id: itemLink,
                link: itemLink,
                content,
                date: new Date(update.data.date),
            });
        });
    });

    return new Response(feed.rss2(), {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
        },
    });
}

function notFoundResponse(message: string) {
    return new Response(message, {
        status: 404,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
