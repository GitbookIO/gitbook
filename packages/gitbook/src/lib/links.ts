import path from 'node:path';
import { getPagePath } from '@/lib/pages';
import { withLeadingSlash, withTrailingSlash } from '@/lib/paths';
import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import type { Link, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import warnOnce from 'warn-once';
import { checkIsAnchor, checkIsExternalURL } from './urls';

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
     * Transform an absolute path in a site, to a relative path from the root of the site.
     */
    toRelativePathInSite(absolutePath: string): string;

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

    /**
     * Create a new linker that overrides some options of the current one.
     */
    fork(override: { spaceBasePath: string }): GitBookLinker;

    /**
     * Site base path used to create this linker.
     */
    siteBasePath: string;

    /**
     * Space base path used to create this linker.
     */
    spaceBasePath: string;
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

    const siteBasePath = withTrailingSlash(withLeadingSlash(servedOn.siteBasePath));
    const spaceBasePath = withTrailingSlash(withLeadingSlash(servedOn.spaceBasePath));

    const linker: GitBookLinker = {
        get siteBasePath() {
            return siteBasePath;
        },

        get spaceBasePath() {
            return spaceBasePath;
        },

        fork(override: {
            spaceBasePath: string;
        }) {
            return createLinker({
                ...servedOn,
                spaceBasePath: override.spaceBasePath,
            });
        },

        toPathInSpace(relativePath: string): string {
            return joinPaths(spaceBasePath, relativePath);
        },

        toPathInSite(relativePath: string): string {
            return joinPaths(siteBasePath, relativePath);
        },

        toRelativePathInSite(absolutePath: string): string {
            const normalizedPath = withLeadingSlash(absolutePath);

            if (!normalizedPath.startsWith(servedOn.siteBasePath)) {
                return normalizedPath;
            }

            return normalizedPath.slice(servedOn.siteBasePath.length);
        },

        toPathForPage({ pages, page, anchor }) {
            return linker.toPathInSpace(getPagePath(pages, page)) + (anchor ? `#${anchor}` : '');
        },

        toAbsoluteURL(absolutePath: string): string {
            // If the path is already a full URL, we return it as is.
            if (URL.canParse(absolutePath)) {
                return absolutePath;
            }

            if (!servedOn.host) {
                return absolutePath;
            }

            return `${servedOn.protocol ?? 'https:'}//${joinPaths(servedOn.host, absolutePath)}`;
        },

        toLinkForContent(rawURL: string): string {
            const url = new URL(rawURL);

            // If the link points to a content in the same site, we return an absolute path
            // instead of a full URL; it makes it possible to use router navigation
            if (url.hostname === servedOn.host && url.pathname.startsWith(servedOn.siteBasePath)) {
                return url.pathname + url.search + url.hash;
            }

            return rawURL;
        },
    };

    return linker;
}

/**
 * Create a new linker that intercepts links that belongs to the published site and rewrite them
 * relative to the URL being served.
 *
 * It is needed for preview of site where the served URL (http://preview/site_abc)
 * is different from the actual published site URL (https://docs.company.com).
 */
export function linkerForPublishedURL(linker: GitBookLinker, rawSitePublishedURL: string) {
    const sitePublishedURL = new URL(rawSitePublishedURL);

    return {
        ...linker,
        toLinkForContent(rawURL: string): string {
            const url = new URL(rawURL);

            // If the link is part of the published site, we rewrite it to be part of the preview site.
            if (
                url.hostname === sitePublishedURL.hostname &&
                url.pathname.startsWith(sitePublishedURL.pathname)
            ) {
                // When detecting that the url has been computed as apart of the published site,
                // we rewrite it to be part of the preview site.
                const extractedPath = url.pathname.slice(sitePublishedURL.pathname.length);
                return linker.toPathInSite(extractedPath) + url.search + url.hash;
            }

            return linker.toLinkForContent(rawURL);
        },
    };
}

/**
 * Create a new linker that always returns absolute URLs.
 */
export function linkerWithAbsoluteURLs(linker: GitBookLinker): GitBookLinker {
    return {
        ...linker,
        toPathInSpace: (path) => linker.toAbsoluteURL(linker.toPathInSpace(path)),
        toPathInSite: (path) => linker.toAbsoluteURL(linker.toPathInSite(path)),
        toPathForPage: (input) => linker.toAbsoluteURL(linker.toPathForPage(input)),
    };
}

/**
 * Create a new linker that resolves links relative to a new spaceBasePath in the current site.
 */
export function linkerWithOtherSpaceBasePath(
    linker: GitBookLinker,
    {
        spaceBasePath,
    }: {
        /**
         * The base path of the space. It should be relative to the root of the site.
         */
        spaceBasePath: string;
    }
): GitBookLinker {
    const newLinker: GitBookLinker = {
        ...linker,
        toPathInSpace(relativePath: string): string {
            return linker.toPathInSite(joinPaths(spaceBasePath, relativePath));
        },
        // implementation matches the base linker toPathForPage, but decouples from using `this` to
        // ensure we always use the updates `toPathInSpace` method.
        toPathForPage({ pages, page, anchor }) {
            return newLinker.toPathInSpace(getPagePath(pages, page)) + (anchor ? `#${anchor}` : '');
        },
    };

    return newLinker;
}

function joinPaths(prefix: string, path: string): string {
    const prefixPath = prefix.endsWith('/') ? prefix : `${prefix}/`;
    const suffixPath = path.startsWith('/') ? path.slice(1) : path;
    const pathWithoutTrailingSlash = removeTrailingSlash(prefixPath + suffixPath);
    return pathWithoutTrailingSlash === '' ? '/' : pathWithoutTrailingSlash;
}

function removeTrailingSlash(path: string): string {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Re-writes the URL of every relative <a> link so it is expressed from the site-root.
 */
export function relativeToAbsoluteLinks(
    linker: GitBookLinker,
    tree: Root,
    currentPagePath: string
): Root {
    const currentDir = path.posix.dirname(currentPagePath);

    visit(tree, 'link', (node: Link) => {
        const original = node.url;

        // Skip anchors, mailto:, http(s):, protocol-like, or already-rooted paths
        if (checkIsExternalURL(original) || checkIsAnchor(original) || original.startsWith('/')) {
            return;
        }

        // Resolve against the current page’s directory and strip any leading “/” or "../"
        // Sometimes the path can be "../" if we are on the default section
        // but it means we are just at the root of the site.
        const pathInPage = path.posix
            .normalize(path.posix.join(currentDir, original))
            .replace(/^[\/\.]+/, '');

        node.url = linker.toAbsoluteURL(linker.toPathInSpace(pathInPage));
    });

    return tree;
}
