import type { GitBookLinker } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { joinPath, joinPathWithBaseURL } from '@/lib/paths';

function createLocalURL(href: string) {
    return new URL(href, 'https://gitbook.local');
}

function toEmbeddablePath(pathname: string, contentPath: string) {
    return joinPath(pathname, '~gitbook/embed/page', contentPath);
}

export function toEmbeddableLinkForPublishedContent(
    linker: GitBookLinker,
    publishedURL: string,
    contentPath: string
): string {
    const spaceRoot = linker.toLinkForContent(publishedURL);
    if (!spaceRoot.startsWith('/')) {
        return joinPathWithBaseURL(publishedURL, contentPath);
    }

    const url = createLocalURL(spaceRoot);
    return `${toEmbeddablePath(url.pathname, contentPath)}${url.search}${url.hash}`;
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

            return `${linker.toPathInSpace(embedPagePath)}${anchor ? `#${anchor}` : ''}`;
        },

        withOtherSiteSpace(override: { spaceBasePath: string }): GitBookLinker {
            return linker.withOtherSiteSpace({
                // We make sure that links in the other site space will be shown in the embeddable view.
                spaceBasePath: joinPath(override.spaceBasePath, '~gitbook/embed/page'),
            });
        },

        toLinkForContent(rawURL: string): string {
            const result = linker.toLinkForContent(rawURL);
            // If the link is not relative or already an embed, return it as is
            if (result.includes('~gitbook/embed') || !result.startsWith('/')) {
                return result;
            }

            const url = createLocalURL(result);
            if (url.pathname.startsWith(linker.spaceBasePath)) {
                const contentPath = url.pathname.slice(linker.spaceBasePath.length);
                return `${linker.toPathInSpace(joinPath('~gitbook/embed/page', contentPath))}${url.search}${url.hash}`;
            }

            return result;
        },
    };
}
