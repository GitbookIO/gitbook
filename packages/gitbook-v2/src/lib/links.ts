import { getPagePath } from '@/lib/pages';
import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

/**
 * Generic interface to generate links based on a given context.
 *
 * URL levels:
 *
 * https://docs.company.com/section/variant/page
 *
 * toPathInContent('some/path') => /section/variant/some/path
 * toPathForPage({ pages, page }) => /section/variant/some/path
 * toAbsoluteURL('some/path') => https://docs.company.com/some/path
 */
export interface GitBookSpaceLinker {
    /**
     * Generate an absolute path for a relative path to the current content.
     */
    toPathInContent(relativePath: string): string;

    /**
     * Generate an absolute path for a page in the current content.
     * The result should NOT be passed to `toPathInContent`.
     */
    toPathForPage(input: {
        pages: RevisionPage[];
        page: RevisionPageDocument | RevisionPageGroup;
        anchor?: string;
    }): string;

    /**
     * Generate an absolute URL for a given path relative to the host of the current content.
     */
    toAbsoluteURL(absolutePath: string): string;

    /**
     * Generate a link (URL or path) for a GitBook content URL (url of another site)
     */
    toLinkForContent(url: string): string;
}

/**
 * Create a linker to resolve links in a context being served on a specific URL.
 */
export function createLinker(
    /** Where the top of the space is served on */
    servedOn: {
        protocol?: string;
        host: string;
        pathname: string;
    }
): GitBookSpaceLinker {
    if (servedOn.host.includes('/')) {
        throw new Error('Host cannot include a slash');
    }

    const linker: GitBookSpaceLinker = {
        toPathInContent(relativePath: string): string {
            return joinPaths(servedOn.pathname, relativePath);
        },

        toAbsoluteURL(absolutePath: string): string {
            return `${servedOn.protocol ?? 'https:'}//${joinPaths(servedOn.host, absolutePath)}`;
        },

        toPathForPage({ pages, page, anchor }) {
            return linker.toPathInContent(getPagePath(pages, page)) + (anchor ? `#${anchor}` : '');
        },

        toLinkForContent(url: string): string {
            return url;
        },
    };

    return linker;
}

/**
 * Append a prefix to a linker.
 */
export function appendBasePathToLinker(
    linker: GitBookSpaceLinker,
    basePath: string
): GitBookSpaceLinker {
    const linkerWithPrefix: GitBookSpaceLinker = {
        toPathInContent(relativePath: string): string {
            return linker.toPathInContent(joinPaths(basePath, relativePath));
        },

        toAbsoluteURL(absolutePath: string): string {
            return linker.toAbsoluteURL(absolutePath);
        },

        toPathForPage({ pages, page, anchor }) {
            return (
                linkerWithPrefix.toPathInContent(getPagePath(pages, page)) +
                (anchor ? `#${anchor}` : '')
            );
        },

        toLinkForContent(url: string): string {
            return linker.toLinkForContent(url);
        },
    };

    return linkerWithPrefix;
}

function joinPaths(prefix: string, path: string): string {
    const prefixPath = prefix.endsWith('/') ? prefix : `${prefix}/`;
    const suffixPath = path.startsWith('/') ? path.slice(1) : path;
    return prefixPath + suffixPath;
}
