import { getPagePath } from '@/lib/pages';
import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

/**
 * Generic interface to generate links based on a given context.
 */
export interface GitBookSpaceLinker {
    /**
     * Generate an absolute path for a relative path in the current space content.
     */
    toPathInSpace(relativePath: string): string;

    /**
     * Generate an absolute path for a page in the current space.
     */
    toPathForPage(input: {
        pages: RevisionPage[];
        page: RevisionPageDocument | RevisionPageGroup;
        anchor?: string;
    }): string;

    /**
     * Generate an absolute URL for a given path.
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
        toPathInSpace(relativePath: string): string {
            return joinPaths(servedOn.pathname, relativePath);
        },

        toAbsoluteURL(absolutePath: string): string {
            return `${servedOn.protocol ?? 'https:'}//${joinPaths(servedOn.host, absolutePath)}`;
        },

        toPathForPage({ pages, page, anchor }) {
            return linker.toPathInSpace(getPagePath(pages, page)) + (anchor ? `#${anchor}` : '');
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
export function appendPrefixToLinker(
    linker: GitBookSpaceLinker,
    prefix: string
): GitBookSpaceLinker {
    const linkerWithPrefix: GitBookSpaceLinker = {
        toPathInSpace(relativePath: string): string {
            return linker.toPathInSpace(joinPaths(prefix, relativePath));
        },

        toAbsoluteURL(absolutePath: string): string {
            return linker.toAbsoluteURL(joinPaths(prefix, absolutePath));
        },

        toPathForPage({ pages, page, anchor }) {
            return (
                linkerWithPrefix.toPathInSpace(getPagePath(pages, page)) +
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
