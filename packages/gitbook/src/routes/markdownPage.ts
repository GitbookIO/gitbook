import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data/errors';
import { resolvePagePath } from '@/lib/pages';
import { type RevisionPage, type RevisionPageDocument, RevisionPageType } from '@gitbook/api';
import { pMapIterable } from 'p-map';

// We limit the concurrency to 100 to avoid reaching limit with concurrent requests
// or file descriptor limits.
const MAX_CONCURRENCY = 100;

/**
 * Generate a markdown version of a page with streaming for better performance.
 * For pages with many children, this streams the output to avoid memory issues.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    const pageLookup = resolvePagePath(context.revision.pages, pagePath);
    if (!pageLookup) {
        return new Response(`Page "${pagePath}" not found`, { status: 404 });
    }

    const { page } = pageLookup;

    if (page.type !== RevisionPageType.Document) {
        return new Response(`Page "${pagePath}" is not a document`, { status: 404 });
    }

    if (page.hidden) {
        return new Response(`Page "${pagePath}" not found`, { status: 404 });
    }

    // Return early if the page has no children.
    if (!page.pages.length) {
        const markdown = await fetchMarkdown(context, page);
        return new Response(markdown, {
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
            },
        });
    }

    // Otherwise, stream the markdown from the page and its children.
    return new Response(
        new ReadableStream<Uint8Array>({
            async pull(controller) {
                await streamMarkdownFromPage(context, page, controller);
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
 * Stream markdown content from a page and its children
 */
async function streamMarkdownFromPage(
    context: GitBookSiteContext,
    page: RevisionPageDocument,
    stream: ReadableStreamDefaultController<Uint8Array>
): Promise<void> {
    const mainPageMarkdown = await fetchMarkdown(context, page);
    stream.enqueue(new TextEncoder().encode(mainPageMarkdown));

    if (page.pages.length > 0) {
        await streamChildPages(context, page.pages, stream);
    }
}

/**
 * Stream markdown from child pages with controlled concurrency.
 * This function recursively handles nested children by streaming them as they become available.
 */
async function streamChildPages(
    context: GitBookSiteContext,
    pages: RevisionPage[],
    stream: ReadableStreamDefaultController<Uint8Array>
): Promise<void> {
    const eligiblePages = getEligiblePages(pages);

    const childPagesMarkdown = pMapIterable(
        eligiblePages,
        async (childPage) => fetchMarkdown(context, childPage),
        {
            concurrency: MAX_CONCURRENCY,
        }
    );

    for await (const childMarkdown of childPagesMarkdown) {
        stream.enqueue(new TextEncoder().encode(`\n\n${childMarkdown}`));
    }
}

/**
 * Fetch markdown from a page.
 */
async function fetchMarkdown(
    context: GitBookSiteContext,
    page: RevisionPageDocument
): Promise<string> {
    const markdown = await throwIfDataError(
        context.dataFetcher.getRevisionPageMarkdown({
            spaceId: context.space.id,
            revisionId: context.revision.id,
            pageId: page.id,
        })
    );
    return markdown;
}

/**
 * Get eligible pages from a list of pages.
 * Pages that are not documents or are hidden are excluded.
 */
function getEligiblePages(pages: RevisionPage[]): RevisionPageDocument[] {
    return pages.filter(
        (childPage): childPage is RevisionPageDocument =>
            childPage.type === RevisionPageType.Document && !childPage.hidden
    );
}
