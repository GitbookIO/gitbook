import { type RouteLayoutParams, getDynamicSiteContext, getStaticSiteContext } from '@/app/utils';
import type { GitBookSiteContext } from '@/lib/context';
import type { GitBookLinker } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { joinPath } from '@/lib/paths';

/**
 * Get the context for the embeddable static routes.
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
 * Get the context for the embeddable dynamic routes.
 */
export async function getEmbeddableDynamicContext(params: RouteLayoutParams) {
    const { context: baseContext, visitorAuthClaims } = await getDynamicSiteContext(params);
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

        withOtherSiteSpace(override: { spaceBasePath: string }): GitBookLinker {
            return linker.withOtherSiteSpace({
                // We make sure that links in the other site space will be shown in the embeddeable view.
                spaceBasePath: joinPath(override.spaceBasePath, '~gitbook/embed/page'),
            });
        },

        toLinkForContent(rawURL: string): string {
            const result = linker.toLinkForContent(rawURL);
            // If the link is not relative or already an embed, return it as is
            if (result.includes('~gitbook/embed') || !result.startsWith('/')) {
                return result;
            }

            // If the link is relative, assume it's a section link and append the embed path
            return joinPath(result, '~gitbook/embed/page');
        },
    };
}
