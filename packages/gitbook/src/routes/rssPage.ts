import type { GitBookSiteContext } from '@/lib/context';
import { getPageDocument } from '@/lib/data/pages';
import { getNodeText } from '@/lib/document';
import { resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { removeLeadingSlash } from '@/lib/paths';
import type {
    DocumentBlock,
    DocumentBlockHeading,
    DocumentBlockUpdate,
    DocumentBlockUpdates,
    JSONDocument,
} from '@gitbook/api';
import { RevisionPageType } from '@gitbook/api';
import { Feed } from 'feed';

/**
 * Find all Updates blocks in a document and extract their Update entries.
 */
function findUpdatesInDocument(document: JSONDocument): Array<{
    updatesBlock: DocumentBlockUpdates;
    updateEntries: DocumentBlockUpdate[];
}> {
    const results: Array<{
        updatesBlock: DocumentBlockUpdates;
        updateEntries: DocumentBlockUpdate[];
    }> = [];

    function traverse(nodes: DocumentBlock[], depth = 0) {
        for (const node of nodes) {
            if (node.type === 'updates') {
                const updatesBlock = node as DocumentBlockUpdates;

                const updateEntries = updatesBlock.nodes.filter(
                    (child): child is DocumentBlockUpdate => child.type === 'update'
                );

                if (updateEntries.length > 0) {
                    results.push({ updatesBlock, updateEntries });
                }
            }
            // Only traverse child nodes if they are blocks (not inlines or text)
            if ('nodes' in node && Array.isArray(node.nodes) && node.object === 'block') {
                // Filter to only blocks before recursing
                const childBlocks: DocumentBlock[] = [];
                for (const child of node.nodes) {
                    if (child.object === 'block') {
                        childBlocks.push(child);
                    }
                }
                if (childBlocks.length > 0) {
                    traverse(childBlocks, depth + 1);
                }
            }
        }
    }

    traverse(document.nodes);
    return results;
}

/**
 * Convert an Update block's content to markdown-like text.
 * This extracts text content from all nodes in the update.
 */
function getUpdateContent(update: DocumentBlockUpdate): string {
    return getNodeText(update).trim();
}

function slugifyHeading(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function getHeadingInfo(update: DocumentBlockUpdate): {
    title?: string;
    anchorId?: string;
} {
    for (const node of update.nodes ?? []) {
        if (node.object !== 'block') {
            continue;
        }
        if (!node.type.startsWith('heading')) {
            continue;
        }

        const title = getNodeText(node).trim();
        const anchorId =
            (isHeadingBlock(node) && node.meta?.id) || (title ? slugifyHeading(title) : undefined);
        return {
            title: title || undefined,
            anchorId: anchorId || undefined,
        };
    }

    return {};
}

function isHeadingBlock(block: DocumentBlock): block is DocumentBlockHeading {
    return block.type.startsWith('heading');
}

/**
 * Generate an RSS feed from Updates blocks in a page.
 * Returns null if no Updates blocks are found.
 */
export async function servePageRSS(
    context: GitBookSiteContext,
    pagePath: string
): Promise<Response | null> {
    const normalizedPath = pagePath === '/' ? '' : removeLeadingSlash(pagePath);
    const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, normalizedPath);

    if (!pageLookup || pageLookup.page.type !== RevisionPageType.Document) {
        return null;
    }

    const { page } = pageLookup;

    const document = await getPageDocument(context, page);

    if (!document) {
        return null;
    }

    const updatesData = findUpdatesInDocument(document);

    // Collect all update entries from all Updates blocks
    const allUpdates: Array<{
        update: DocumentBlockUpdate;
        date: Date;
        content: string;
    }> = [];

    for (const { updateEntries } of updatesData) {
        for (const update of updateEntries) {
            const dateStr = update.data?.date;

            if (!dateStr) {
                continue;
            }

            const date = new Date(dateStr);
            if (Number.isNaN(date.getTime())) {
                continue;
            }

            const content = getUpdateContent(update);

            if (!content) {
                continue;
            }

            allUpdates.push({ update, date, content });
        }
    }

    if (allUpdates.length === 0) {
        return null;
    }

    // Sort updates by date (newest first)
    allUpdates.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Get page URL
    const pagePathForLink = context.linker.toPathForPage({ pages: context.revision.pages, page });
    const pageURL = context.linker.toAbsoluteURL(pagePathForLink);

    // Get feed URL - exposed as `/feed.xml`
    const normalizedPagePath =
        pagePathForLink.endsWith('/') && pagePathForLink !== '/'
            ? pagePathForLink.slice(0, -1)
            : pagePathForLink;
    const rssPath = `${normalizedPagePath}/feed.xml`;
    const rssURL = context.linker.toAbsoluteURL(rssPath);
    const docsURL = context.linker.toAbsoluteURL(
        context.linker.siteBasePath || context.linker.spaceBasePath
    );

    // Create RSS feed
    const feed = new Feed({
        title: page.title,
        description: page.description || `Updates feed for ${page.title}`,
        id: pageURL,
        link: pageURL,
        copyright: `Copyright ${new Date().getFullYear()}`,
        updated: allUpdates[0]?.date ?? new Date(),
        feedLinks: {
            rss: rssURL,
        },
        docs: docsURL,
    });

    // Add update entries as feed items
    for (const { update, date, content } of allUpdates) {
        // Create the anchor link for the update
        const headingInfo = getHeadingInfo(update);
        const anchorId = headingInfo.anchorId;
        const itemLink = `${pageURL}#${anchorId}`;

        // Extract title from first line or heading, fallback to date
        const firstLine = content.split('\n')[0]?.trim() || '';
        const title =
            headingInfo.title && headingInfo.title.length > 0
                ? headingInfo.title
                : firstLine.length > 0 && firstLine.length < 100
                  ? firstLine
                  : `Update - ${date.toLocaleDateString()}`;

        feed.addItem({
            title: title,
            id: itemLink,
            link: itemLink,
            content,
            date: date,
        });
    }

    return new Response(feed.rss2(), {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
        },
    });
}
