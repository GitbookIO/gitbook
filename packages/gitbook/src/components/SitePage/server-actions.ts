'use server';

import { getSimilarPages } from '@/lib/pages';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';

const MAX_RELATED_PAGES = 5;

/**
 * Server action returning the pages most similar to a (not found) path.
 *
 * It reuses the same `getSimilarPages` ranking as the Markdown 404, computed server-side from
 * the site context rebuilt from the middleware headers — so the page tree is never shipped to
 * the client and the not-found page only receives the handful of suggestions it renders.
 */
export async function getRelatedPages(pagePath: string) {
    const context = await fetchServerActionSiteContext(await getServerActionBaseContext());
    const pages = getSimilarPages(context.revision.pages, pagePath, MAX_RELATED_PAGES);

    return pages.map((page) => ({
        id: page.id,
        title: page.title,
        href: context.linker.toPathForPage({ pages: context.revision.pages, page }),
        emoji: page.emoji ?? undefined,
        icon: page.icon ?? undefined,
    }));
}
