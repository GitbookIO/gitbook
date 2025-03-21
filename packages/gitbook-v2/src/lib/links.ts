import { getPagePath } from '@/lib/pages';
import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import warnOnce from 'warn-once';

/**
 * Generic interface to generate links based on a given context.
 *
 * URL levels:
 *
 * https://docs.company.com/basename/section/variant/page
 *
 * toPathInSpace('some/path') => /basename/section/variant/some/path
 * toPathInSite('some/path') => /basename/some/path
 * toPathForPage({ pages, page }) => /basename/section/variant/some/path
 * toAbsoluteURL('some/path') => https://docs.company.com/some/path
 */
export interface GitBookLinker {
    /**
     * Generate an absolute path for a relative path to the current content.
     */
    toPathInSpace(relativePath: string): string;

    /**
     * Generate an absolute path for a relative path to the current site.
     */
    toPathInSite(relativePath: string): string;

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
        host?: string;

        /** The base path of the space */
        spaceBasePath: string;

        /** The base path of the site */
        siteBasePath: string;
    }
): GitBookLinker {
    warnOnce(!servedOn.host, 'No host provided to createLinker. It can lead to issues with links.');

    const linker: GitBookLinker = {
        toPathInSpace(relativePath: string): string {
            return joinPaths(servedOn.spaceBasePath, relativePath);
        },

        toPathInSite(relativePath: string): string {
            return joinPaths(servedOn.siteBasePath, relativePath);
        },

        toAbsoluteURL(absolutePath: string): string {
            if (!servedOn.host) {
                return absolutePath;
            }

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

function joinPaths(prefix: string, path: string): string {
    const prefixPath = prefix.endsWith('/') ? prefix : `${prefix}/`;
    const suffixPath = path.startsWith('/') ? path.slice(1) : path;
    return prefixPath + suffixPath;
}
