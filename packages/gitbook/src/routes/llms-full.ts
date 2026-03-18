import { type GitBookSiteContext, checkIsRootSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { fromPageMarkdown, toPageMarkdown } from '@/lib/markdownPage';
import { joinPath } from '@/lib/paths';
import { getIndexablePages } from '@/lib/sitemap';
import { getSiteStructureSections } from '@/lib/sites';
import type { RevisionPageDocument, SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import type { Paragraph } from 'mdast';
import { pMapIterable } from 'p-map';

// We limit the concurrency to 100 to avoid reaching limit with concurrent requests
// or file descriptor limits.
const MAX_CONCURRENCY = 100;

// Default limit for pages per batch
const DEFAULT_PAGE_LIMIT = 100;

/**
 * Generate a llms-full.txt file for the site.
 * As the result can be large, we stream it as we generate it.
 */
export async function serveLLMsFullTxt(context: GitBookSiteContext, page = 0) {
    if (!checkIsRootSiteContext(context)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    const offset = page * DEFAULT_PAGE_LIMIT;

    return new Response(
        new ReadableStream<Uint8Array>({
            async pull(controller) {
                await streamMarkdownFromSiteStructure(context, controller, offset);
                controller.close();
            },
        }),
        {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
            },
        }
    );
}

/**
 * Stream markdown from site structure.
 */
async function streamMarkdownFromSiteStructure(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    offset: number
): Promise<void> {
    switch (context.structure.type) {
        case 'sections':
            return streamMarkdownFromSections(
                context,
                stream,
                getSiteStructureSections(context.structure, { ignoreGroups: true }),
                offset
            );
        case 'siteSpaces':
            await streamMarkdownFromSiteSpaces(
                context,
                stream,
                context.structure.structure,
                '',
                offset
            );
            return;
        default:
            assertNever(context.structure);
    }
}

/**
 * Stream markdown from site sections.
 */
async function streamMarkdownFromSections(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    siteSections: SiteSection[],
    offset: number
): Promise<void> {
    let currentPageIndex = 0;

    for (const siteSection of siteSections) {
        const result = await streamMarkdownFromSiteSpaces(
            context,
            stream,
            siteSection.siteSpaces,
            siteSection.path,
            offset,
            currentPageIndex
        );
        currentPageIndex = result.currentPageIndex;

        if (result.reachedLimit) {
            break;
        }
    }
}

/**
 * Stream markdown from site spaces.
 */
export async function streamMarkdownFromSiteSpaces(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    siteSpaces: SiteSpace[],
    basePath: string,
    offset = 0,
    initialPageIndex = 0
): Promise<{ currentPageIndex: number; reachedLimit: boolean }> {
    const { dataFetcher } = context;
    let totalPagesProcessed = initialPageIndex;

    // Collect all pages first
    const allPages: Array<{ page: RevisionPageDocument; siteSpace: SiteSpace; basePath: string }> =
        [];

    for (const siteSpace of siteSpaces) {
        const siteSpaceUrl = siteSpace.urls.published;
        if (!siteSpaceUrl) {
            continue;
        }
        const revision = await throwIfDataError(
            dataFetcher.getRevision({
                spaceId: siteSpace.space.id,
                revisionId: siteSpace.space.revision,
            })
        );
        const pages = getIndexablePages(revision.pages);

        // Add document pages to our collection
        for (const { page } of pages) {
            if (page.type === 'document') {
                allPages.push({
                    page,
                    siteSpace,
                    basePath,
                });
            }
        }
    }

    // Apply pagination - skip pages before offset
    const pagesToProcess = allPages.slice(offset, offset + DEFAULT_PAGE_LIMIT);
    totalPagesProcessed = offset;

    // Process the pages
    for await (const markdown of pMapIterable(
        pagesToProcess,
        async ({ page, siteSpace, basePath }) => {
            return getMarkdownForPage(context, siteSpace, page, basePath);
        },
        {
            concurrency: MAX_CONCURRENCY,
        }
    )) {
        stream.enqueue(new TextEncoder().encode(markdown));
        totalPagesProcessed++;
    }

    // Check if there are more pages and add next page link if needed
    const hasMorePages = allPages.length > offset + DEFAULT_PAGE_LIMIT;
    if (hasMorePages) {
        const nextPage = Math.floor(offset / DEFAULT_PAGE_LIMIT) + 1;
        const nextPageUrl = context.linker.toPathInSite(`llms-full.txt/${nextPage}`);
        const nextPageLink = `\n\n---\n\n[Next Page](${nextPageUrl})\n\n`;
        stream.enqueue(new TextEncoder().encode(nextPageLink));
    }

    return { currentPageIndex: totalPagesProcessed, reachedLimit: hasMorePages };
}

/**
 * Get markdown from a page.
 */
async function getMarkdownForPage(
    context: GitBookSiteContext,
    siteSpace: SiteSpace,
    page: RevisionPageDocument,
    basePath: string
): Promise<string> {
    const { dataFetcher } = context;

    const pageMarkdown = await throwIfDataError(
        dataFetcher.getRevisionPageMarkdown({
            spaceId: siteSpace.space.id,
            revisionId: siteSpace.space.revision,
            pageId: page.id,
        })
    );

    const tree = fromPageMarkdown({
        linker: context.linker.fork({
            spaceBasePath: joinPath(context.linker.siteBasePath, basePath),
        }),
        markdown: pageMarkdown,
        pagePath: page.path,
    });

    if (page.description) {
        // The first node is the page title as a H1, we insert the description as a paragraph
        // after it.
        const descriptionNode: Paragraph = {
            type: 'paragraph',
            children: [{ type: 'text', value: page.description }],
        };
        tree.children.splice(1, 0, descriptionNode);
    }

    const markdown = toPageMarkdown(tree);

    return `${markdown}\n\n`;
}
