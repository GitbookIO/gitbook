import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { resolvePagePath } from '@/lib/pages';
import { RevisionPageType } from '@gitbook/api';

/**
 * Generate a markdown version of a page.
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
