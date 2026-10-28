import assertNever from 'assert-never';
import type { Paragraph } from 'mdast';
import pMap, { pMapIterable } from 'p-map';

import type { RevisionPageDocument, SiteSection, SiteSpace } from '@gitbook/api';

import { renderSiteAgentInstructions } from '@/lib/ask-prompt';
import {
    type GitBookSiteContext,
    checkIsRootSiteContext,
    fetchSiteContextForSiteSpace,
} from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { getMarkdownContentType } from '@/lib/markdown-content-type';
import { fromPageMarkdown, toPageMarkdown } from '@/lib/markdownPage';
import { getIndexablePages } from '@/lib/sitemap';
import { filterSiteSpacesByLocale, getSiteStructureSections } from '@/lib/sites';

// We limit the concurrency to 100 to avoid reaching limit with concurrent requests
// or file descriptor limits.
const MAX_CONCURRENCY = 100;

const MAX_PAGES_PER_PART = 100;

// Vercel rejects responses over 4.5MB. Parts are sized from the raw markdown, so leave headroom
// for the output growing when links are rewritten to absolute URLs.
const MAX_BYTES_PER_PART = 3 * 1024 * 1024;

type MarkdownPageEntry = { context: GitBookSiteContext; page: RevisionPageDocument };

// A page, or one chunk of a page too large to fit in a single part.
type MarkdownPartEntry = MarkdownPageEntry & {
    pageNumber: number;
    chunk: number;
    chunkCount: number;
    bytes: number;
};

/**
 * Generate a llms-full.txt file for the site.
 * As the result can be large, we stream it as we generate it.
 */
export async function serveLLMsFullTxt(context: GitBookSiteContext, part = 0) {
    if (!checkIsRootSiteContext(context)) {
        return new Response('llms.txt is only served from the root of the site', { status: 404 });
    }

    const allPages = await getMarkdownPageEntriesFromSiteStructure(context);
    const parts = await splitIntoParts(allPages);

    if (part >= parts.length) {
        return new Response('No content found', { status: 404 });
    }

    return new Response(
        new ReadableStream<Uint8Array>({
            async pull(controller) {
                await streamMarkdownPart(context, controller, {
                    parts,
                    part,
                    totalPages: allPages.length,
                });
                controller.close();
            },
        }),
        {
            headers: {
                'Content-Type': getMarkdownContentType(context.isChatGPT),
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
    return getMarkdownPageEntriesFromFilteredSiteSpaces(
        siteSections.flatMap((siteSection) =>
            filterSiteSpacesByLocale(siteSection.siteSpaces, context.locale)
        ),
        context
    );
}

/**
 * Get the document pages that should be included in the full llms.txt output for site spaces.
 */
async function getMarkdownPageEntriesFromSiteSpaces(
    context: GitBookSiteContext,
    siteSpaces: SiteSpace[]
): Promise<MarkdownPageEntry[]> {
    return getMarkdownPageEntriesFromFilteredSiteSpaces(
        filterSiteSpacesByLocale(siteSpaces, context.locale),
        context
    );
}

/**
 * Get markdown page entries from already locale-filtered site spaces.
 */
async function getMarkdownPageEntriesFromFilteredSiteSpaces(
    siteSpaces: SiteSpace[],
    context: GitBookSiteContext
): Promise<MarkdownPageEntry[]> {
    const publishedSiteSpaces = siteSpaces.filter((siteSpace) => siteSpace.urls.published);

    const allPages = await pMap(
        publishedSiteSpaces,
        async (siteSpace): Promise<MarkdownPageEntry[]> => {
            const siteSpaceContext = await fetchSiteContextForSiteSpace(context, siteSpace);
            const pages = getIndexablePages(siteSpaceContext.revision.pages);

            return pages.flatMap(({ page }) => {
                if (page.type !== 'document') {
                    return [];
                }

                return [
                    {
                        context: siteSpaceContext,
                        page,
                    },
                ];
            });
        },
        {
            concurrency: MAX_CONCURRENCY,
        }
    );

    return allPages.flat();
}

/**
 * Group the pages into parts that each stay under the page and size limits.
 */
async function splitIntoParts(allPages: MarkdownPageEntry[]): Promise<MarkdownPartEntry[][]> {
    const entries = await pMap(allPages, (entry, index) => splitPageIntoChunks(entry, index + 1), {
        concurrency: MAX_CONCURRENCY,
    });

    const parts: MarkdownPartEntry[][] = [];
    let currentPart: MarkdownPartEntry[] = [];
    let currentBytes = 0;

    for (const entry of entries.flat()) {
        const isFull =
            currentPart.length >= MAX_PAGES_PER_PART ||
            currentBytes + entry.bytes > MAX_BYTES_PER_PART;

        if (isFull && currentPart.length > 0) {
            parts.push(currentPart);
            currentPart = [];
            currentBytes = 0;
        }

        currentPart.push(entry);
        currentBytes += entry.bytes;
    }

    if (currentPart.length > 0) {
        parts.push(currentPart);
    }

    return parts;
}

/**
 * Split a page into as many chunks as needed for each to fit in a part.
 */
async function splitPageIntoChunks(
    entry: MarkdownPageEntry,
    pageNumber: number
): Promise<MarkdownPartEntry[]> {
    const markdown = await fetchPageMarkdown(entry.context, entry.page);
    const bytes = Buffer.byteLength(markdown);
    const chunkCount = Math.max(1, Math.ceil(bytes / MAX_BYTES_PER_PART));

    return Array.from({ length: chunkCount }, (_, chunk) => ({
        ...entry,
        pageNumber,
        chunk,
        chunkCount,
        bytes: bytes / chunkCount,
    }));
}

/**
 * Get one of `chunkCount` chunks of a page's markdown, splitting it between headings,
 * or between paragraphs when a single heading's section is too large.
 */
function getMarkdownChunk(markdown: string, chunk: number, chunkCount: number): string {
    if (chunkCount === 1) {
        return markdown;
    }

    const headingSections = markdown.split(/(?<=\n)(?=#{1,6} )/);
    const hasOversizedSection = headingSections.some(
        (section) => Buffer.byteLength(section) > MAX_BYTES_PER_PART
    );
    const sections = hasOversizedSection ? markdown.split(/(?<=\n\n)/) : headingSections;
    const sectionsPerChunk = Math.ceil(sections.length / chunkCount);

    return sections.slice(chunk * sectionsPerChunk, (chunk + 1) * sectionsPerChunk).join('');
}

/**
 * Stream a single part of llms-full.txt.
 */
async function streamMarkdownPart(
    context: GitBookSiteContext,
    stream: ReadableStreamDefaultController<Uint8Array>,
    { parts, part, totalPages }: { parts: MarkdownPartEntry[][]; part: number; totalPages: number }
): Promise<void> {
    const entries = parts[part] ?? [];
    const partCount = parts.length;
    const firstPage = entries[0]?.pageNumber;
    const lastPage = entries.at(-1)?.pageNumber;

    // Agents often grep the file or only read its start, so announce the other parts up front.
    if (partCount > 1) {
        const pages =
            firstPage === lastPage ? `page ${firstPage}` : `pages ${firstPage}–${lastPage}`;
        const header = [
            `> This is part ${part + 1} of ${partCount} of the full documentation (${pages} of ${totalPages}).`,
            '> The content is paginated: fetch every part to see all of it.',
        ];
        if (part > 0) {
            header.push(`> Previous part: ${getPartURL(context, part - 1)}`);
        }
        if (part < partCount - 1) {
            header.push(`> Next part: ${getPartURL(context, part + 1)}`);
        }
        header.push(
            `> Page index: ${context.linker.toAbsoluteURL(context.linker.toPathInSite('llms.txt'))}`
        );
        stream.enqueue(new TextEncoder().encode(`${header.join('\n')}\n\n`));
    }

    // Rendered up front, on every part, since agents may only read the start of the file.
    const agentInstructions = renderSiteAgentInstructions(context);
    if (agentInstructions) {
        stream.enqueue(new TextEncoder().encode(`${agentInstructions}\n---\n\n`));
    }

    for await (const markdown of pMapIterable(
        entries,
        async ({ context: siteSpaceContext, page, chunk, chunkCount }) => {
            const pageMarkdown = await getMarkdownForPage(siteSpaceContext, page);
            return getMarkdownChunk(pageMarkdown, chunk, chunkCount);
        },
        {
            concurrency: MAX_CONCURRENCY,
        }
    )) {
        stream.enqueue(new TextEncoder().encode(markdown));
    }

    if (part < partCount - 1) {
        const nextPageUrl = getPartURL(context, part + 1);
        const nextPageLink = `\n\n---\n\n[Next Page](${nextPageUrl})\n\n`;
        stream.enqueue(new TextEncoder().encode(nextPageLink));
    }
}

/**
 * Get the absolute URL of a part of llms-full.txt.
 */
function getPartURL(context: GitBookSiteContext, part: number) {
    const path = part === 0 ? 'llms-full.txt' : `llms-full.txt/${part}`;
    return context.linker.toAbsoluteURL(context.linker.toPathInSite(path));
}

/**
 * Get markdown from a page.
 */
async function getMarkdownForPage(
    context: GitBookSiteContext,
    page: RevisionPageDocument
): Promise<string> {
    const tree = await fromPageMarkdown(context, {
        markdown: await fetchPageMarkdown(context, page),
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

/**
 * Fetch the raw markdown of a page.
 */
function fetchPageMarkdown(context: GitBookSiteContext, page: RevisionPageDocument) {
    return throwIfDataError(
        context.dataFetcher.getRevisionPageMarkdown({
            spaceId: context.space.id,
            revisionId: context.revisionId,
            pageId: page.id,
        })
    );
}
