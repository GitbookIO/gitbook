import {
    type GitBookSiteContext,
    checkIsRootSiteContext,
    fetchSiteContextForSiteSpace,
} from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { fromPageMarkdown, toPageMarkdown } from '@/lib/markdownPage';
import { getIndexablePages } from '@/lib/sitemap';
import { filterSiteSpacesByLocale, getSiteStructureSections } from '@/lib/sites';
import type { RevisionPageDocument, SiteSection, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';
import type { Paragraph } from 'mdast';
import { pMapIterable } from 'p-map';

// We limit the concurrency to 100 to avoid reaching limit with concurrent requests
// or file descriptor limits.
const MAX_CONCURRENCY = 100;

// Default limit for pages per batch
const DEFAULT_PAGE_LIMIT = 100;

type MarkdownPageEntry = { context: GitBookSiteContext; page: RevisionPageDocument };

/**
 * Generate a llms-full.txt file for the site.
 * As the result can be large, we stream it as we generate it.
 */
export async function serveLLMsFullTxt(context: GitBookSiteContext, page = 0) {
    if (!checkIsRootSiteContext(context)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    const offset = page * DEFAULT_PAGE_LIMIT;
    const allPages = await getMarkdownPageEntriesFromSiteStructure(context);

    if (allPages.length <= offset) {
        return new Response('No content found', { status: 404 });
    }

    return new Response(
        new ReadableStream<Uint8Array>({
            async pull(controller) {
                await streamMarkdownPageEntries(context, controller, allPages, offset);
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
 * Get the document pages that should be included in the full llms.txt output for a site structure.
 */
async function getMarkdownPageEntriesFromSiteStructure(
    context: GitBookSiteContext
): Promise<MarkdownPageEntry[]> {
    switch (context.structure.type) {
        case 'sections':
            return getMarkdownPageEntriesFromSections(
                context,
                getSiteStructureSections(context.structure, { ignoreGroups: true })
            );
        case 'siteSpaces':
            return getMarkdownPageEntriesFromSiteSpaces(context, context.structure.structure);
        default:
            assertNever(context.structure);
    }
}

/**
 * Get the document pages that should be included in the full llms.txt output for site sections.
 */
async function getMarkdownPageEntriesFromSections(
    context: GitBookSiteContext,
    siteSections: SiteSection[]
): Promise<MarkdownPageEntry[]> {
    const allPages: MarkdownPageEntry[] = [];

    for (const siteSection of siteSections) {
        allPages.push(
            ...(await getMarkdownPageEntriesFromSiteSpaces(context, siteSection.siteSpaces))
        );
    }

    return allPages;
}

/**
 * Get the document pages that should be included in the full llms.txt output for site spaces.
 */
async function getMarkdownPageEntriesFromSiteSpaces(
    context: GitBookSiteContext,
    siteSpaces: SiteSpace[]
): Promise<MarkdownPageEntry[]> {
    const allPages: MarkdownPageEntry[] = [];

    const filteredSiteSpaces = filterSiteSpacesByLocale(siteSpaces, context.locale);

    for (const siteSpace of filteredSiteSpaces) {
        const siteSpaceUrl = siteSpace.urls.published;
        if (!siteSpaceUrl) {
            continue;
        }
        const siteSpaceContext = await fetchSiteContextForSiteSpace(context, siteSpace);
        const pages = getIndexablePages(siteSpaceContext.revision.pages);

        // Add document pages to our collection
        for (const { page } of pages) {
            if (page.type === 'document') {
                allPages.push({
                    context: siteSpaceContext,
                    page,
                });
            }
        }
    }

    return allPages;
}

/**
 * Stream a single paginated window of markdown page entries.
 */
async function streamMarkdownPageEntries(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    allPages: MarkdownPageEntry[],
    offset: number
): Promise<{ currentPageIndex: number; reachedLimit: boolean }> {
    // Apply pagination - skip pages before offset
    const pagesToProcess = allPages.slice(offset, offset + DEFAULT_PAGE_LIMIT);
    let totalPagesProcessed = offset;

    // Process the pages
    for await (const markdown of pMapIterable(
        pagesToProcess,
        async ({ context: siteSpaceContext, page }) => {
            return getMarkdownForPage(siteSpaceContext, page);
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
    page: RevisionPageDocument
): Promise<string> {
    const { dataFetcher } = context;

    const pageMarkdown = await throwIfDataError(
        dataFetcher.getRevisionPageMarkdown({
            spaceId: context.space.id,
            revisionId: context.revisionId,
            pageId: page.id,
        })
    );

    const tree = await fromPageMarkdown(context, {
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
