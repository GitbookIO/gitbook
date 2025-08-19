import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import type { GitBookSiteContext } from '@/lib/context';
import type { GitBookLinker } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { joinPath } from '@/lib/paths';

/**
 * Get the context for the embeddable routes.
 */
export async function getEmbedSiteContext(params: RouteLayoutParams) {
    const { context: baseContext, visitorAuthClaims } = await getStaticSiteContext(params);

    // Adapt the linker to display pages in their embedded view
    const linker: GitBookLinker = {
        ...baseContext.linker,
        toPathForPage({ pages, page, anchor }) {
            const pagePath = getPagePath(pages, page);
            const embedPagePath = joinPath('~gitbook/embed/page', pagePath);

            return linker.toPathInSpace(embedPagePath) + (anchor ? `#${anchor}` : '');
        },
    };

    const context: GitBookSiteContext = {
        ...baseContext,
        linker,
    };

    return {
        context,
        visitorAuthClaims,
    };
}
