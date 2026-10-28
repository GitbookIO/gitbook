import { Feed } from 'feed';

import type {
    DocumentBlock,
    DocumentInline,
    DocumentText,
    RevisionPageDocument,
} from '@gitbook/api';
import { RevisionPageType } from '@gitbook/api';

import { getPageFullTitle } from '@/components/SitePage';
import type { GitBookSiteContext } from '@/lib/context';
import { getPageDocument } from '@/lib/data/pages';
import { getBlocksByType, getNodeText, isHeadingBlock } from '@/lib/document';
import { escapeHTML } from '@/lib/html';
import { joinPath } from '@/lib/paths';
import { resolveSiteSpacePagePathDocumentOrGroup } from '@/lib/sites';

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
): Promise<Response> {
    const pageLookup = resolveSiteSpacePagePathDocumentOrGroup(
        context.siteSpace,
        context.revision.pages,
        inputPagePath
    );

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
            const content = contentNodes.map((node) => getNodeHTML(node)).join('');

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

/**
 * Feed readers render `<content:encoded>` as HTML, so block structure must be kept as tags.
 */
function getNodeHTML(node: DocumentBlock | DocumentInline | DocumentText): string {
    if (node.object === 'text') {
        return escapeHTML(getNodeText(node));
    }

    const children = 'nodes' in node ? node.nodes.map((child) => getNodeHTML(child)).join('') : '';
    if (node.object === 'inline') {
        return children;
    }

    switch (node.type) {
        case 'paragraph':
            return `<p>${children}</p>`;
        case 'heading-1':
            return `<h2>${children}</h2>`;
        case 'heading-2':
            return `<h3>${children}</h3>`;
        case 'heading-3':
            return `<h4>${children}</h4>`;
        case 'list-unordered':
        case 'list-tasks':
            return `<ul>${children}</ul>`;
        case 'list-ordered':
            return node.data.start !== undefined
                ? `<ol start="${node.data.start}">${children}</ol>`
                : `<ol>${children}</ol>`;
        case 'list-item':
            return `<li>${children}</li>`;
        case 'blockquote':
        case 'hint':
            return `<blockquote>${children}</blockquote>`;
        case 'code':
            return `<pre><code>${node.nodes.map((line) => escapeHTML(getNodeText(line))).join('\n')}</code></pre>`;
        default:
            return children;
    }
}

function notFoundResponse(message: string) {
    return new Response(message, {
        status: 404,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
