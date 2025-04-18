import { resolvePagePath } from '@/lib/pages';
import { RevisionPageType } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import { throwIfDataError } from '@v2/lib/data';

/**
 * Generate a markdown version of a page.
 */
export async function servePageMarkdown(context: GitBookSiteContext, pagePath: string) {
    const pageLookup = resolvePagePath(context.pages, pagePath);
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
            revisionId: context.revisionId,
            pageId: page.id,
        })
    );

    return new Response(markdown, {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
        },
    });
}
