import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import type { GitBookSiteContext } from '@/lib/context';
import type { GitBookLinker } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { joinPath } from '@/lib/paths';

/**
 * Get the context for the embeddable routes.
 */
export async function getEmbeddableStaticContext(params: RouteLayoutParams) {
    const { context: baseContext, visitorAuthClaims } = await getStaticSiteContext(params);
    const context: GitBookSiteContext = {
        ...baseContext,
        linker: getEmbeddableLinker(baseContext.linker),
    };

    return {
        context,
        visitorAuthClaims,
    };
}

/**
 * Get a linker to generate links in the embeddable context.
 */
export function getEmbeddableLinker(linker: GitBookLinker): GitBookLinker {
    return {
        ...linker,
        toPathForPage({ pages, page, anchor }) {
            const pagePath = getPagePath(pages, page);
            const embedPagePath = joinPath('~gitbook/embed/page', pagePath);

            return linker.toPathInSpace(embedPagePath) + (anchor ? `#${anchor}` : '');
        },
    };
}
