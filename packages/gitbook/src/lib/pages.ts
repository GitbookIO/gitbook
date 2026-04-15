import {
    type Revision,
    type RevisionPage,
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';
import leven from 'leven';
import { removeLeadingSlash, removeTrailingSlash } from './paths';

export type AncestorRevisionPage = RevisionPageDocument | RevisionPageGroup;

export type ResolvedPagePath<Page extends RevisionPageDocument | RevisionPageGroup> = {
    page: Page;
    ancestors: AncestorRevisionPage[];
};

/**
 * Resolve a page path to a page document.
 */
export function resolvePagePath(
    rootPages: Revision['pages'],
    pagePath: string
): ResolvedPagePath<RevisionPageDocument> | undefined {
    const result = findPageByPath(rootPages, pagePath);

    if (!result) {
        return undefined;
    }

    return resolvePageDocument(result.page, result.ancestors);
}

/**
 * Resolve a page path to a page document or group.
 * Similar to resolvePagePath but returns both documents and groups.
 */
export function resolvePagePathDocumentOrGroup(
    rootPages: Revision['pages'],
    pagePath: string
): ResolvedPagePath<RevisionPageDocument | RevisionPageGroup> | undefined {
    const result = findPageByPath(rootPages, pagePath);

    if (!result) {
        return undefined;
    }

    return { page: result.page, ancestors: result.ancestors };
}

/**
 * Helper function to find a page by path, handling empty paths and page iteration.
 */
function findPageByPath(
    rootPages: Revision['pages'],
    pagePath: string
): ResolvedPagePath<RevisionPageDocument | RevisionPageGroup> | undefined {
    if (!pagePath) {
        const firstPage = resolveFirstDocument(rootPages, []);
        if (!firstPage) {
            return undefined;
        }
        return { page: firstPage.page, ancestors: firstPage.ancestors };
    }

    const iteratePages = (
        pages: RevisionPage[],
        ancestors: AncestorRevisionPage[]
    ): ResolvedPagePath<RevisionPageDocument | RevisionPageGroup> | undefined => {
        for (const page of pages) {
            if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
                continue;
            }

            if (page.path !== pagePath) {
                // TODO: can be optimized to count the number of slashes and skip the entire subtree
                const result = iteratePages(page.pages, [...ancestors, page]);
                if (result) {
                    return result;
                }

                continue;
            }

            return { page, ancestors };
        }
    };

    return iteratePages(rootPages, []);
}

/**
 * Find a page by its ID in a revision.
 */
export function resolvePageId(
    rootPages: Revision['pages'],
    pageId: string
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    const iteratePages = (
        pages: RevisionPage[],
        ancestors: AncestorRevisionPage[]
    ): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined => {
        for (const page of pages) {
            if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
                continue;
            }

            if (page.id === pageId) {
                return resolvePageDocument(page, ancestors);
            }

            const result = iteratePages(page.pages, [...ancestors, page]);
            if (result) {
                return result;
            }
        }
    };
    return iteratePages(rootPages, []);
}

/**
 * Resolve the next/previous page before another one.
 * It ignores hidden pages as this is used for navigation purpose.
 */
export function resolvePrevNextPages(
    rootPages: Revision['pages'],
    page: RevisionPageDocument
): { previous?: RevisionPageDocument; next?: RevisionPageDocument } {
    const flat = flattenPages(rootPages, (page) => !page.hidden);

    const currentIndex = flat.findIndex((p) => p.id === page.id);
    if (currentIndex === -1) {
        return {};
    }

    const previous = flat[currentIndex - 1];
    const next = flat[currentIndex + 1];

    return {
        previous,
        next,
    };
}

/**
 * Resolve a page to its canonical path. The first page of the site will return "".
 * The path will NOT start with "/".
 */
export function getPagePath(
    rootPages: Revision['pages'],
    page: RevisionPageDocument | RevisionPageGroup
): string {
    const firstPage = resolveFirstDocument(rootPages, []);

    if (firstPage && firstPage.page.id === page.id) {
        return '';
    }

    return page.path;
}

/**
 * Get all possible paths for a page.
 */
export function getPagePaths(
    rootPages: Revision['pages'],
    page: RevisionPageDocument | RevisionPageGroup
): string[] {
    const path = getPagePath(rootPages, page);
    if (path === page.path) {
        return [path];
    }
    return [path, page.path];
}

/**
 * Test if a page has at least one descendant.
 */
export function hasPageVisibleDescendant(page: RevisionPageGroup | RevisionPageDocument): boolean {
    return (
        page.pages.length > 0 &&
        page.pages.some(
            (child) =>
                (child.type === RevisionPageType.Link ||
                    child.type === RevisionPageType.Document) &&
                !child.hidden
        )
    );
}

/**
 * Resolve the first page document in a list of pages.
 */
export function resolveFirstDocument(
    pages: RevisionPage[],
    ancestors: AncestorRevisionPage[]
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    for (const page of pages) {
        if (page.type === 'link') {
            continue;
        }

        const result = resolvePageDocument(page, ancestors);
        if (result) {
            return result;
        }
    }

    return;
}

/**
 * Get a similar pages to a given path. This is used to suggest similar pages when a page is not found.
 */
export function getSimilarPages(
    rootPages: RevisionPage[],
    pagePath: string,
    topK = 5
): RevisionPageDocument[] {
    if (topK <= 0) {
        return [];
    }

    const pages = flattenPages(rootPages, (page) => !page.hidden);
    if (pages.length === 0) {
        return [];
    }

    const inputPath = createComparablePagePath(pagePath);
    if (!inputPath.path) {
        return pages.slice(0, topK);
    }

    const firstPageId = resolveFirstDocument(rootPages, [])?.page.id;

    return pages
        .map((page, index) => {
            const candidatePaths = new Set([page.path]);
            if (page.id === firstPageId) {
                candidatePaths.add('');
            }

            let score = 0;
            for (const candidatePath of candidatePaths) {
                score = Math.max(
                    score,
                    scoreComparablePagePaths(inputPath, createComparablePagePath(candidatePath))
                );
            }

            return { page, index, score };
        })
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .slice(0, topK)
        .map(({ page }) => page);
}

type ComparablePagePath = {
    path: string;
    segments: string[];
    tokens: string[];
    lastSegment: string;
};

function createComparablePagePath(path: string): ComparablePagePath {
    const normalizedPath = removeTrailingSlash(removeLeadingSlash(path.trim().toLowerCase()))
        .split('/')
        .filter(Boolean)
        .join('/');
    const segments = normalizedPath ? normalizedPath.split('/') : [];
    const tokens = segments.flatMap((segment) => segment.split(/[-_\s]+/g)).filter(Boolean);

    return {
        path: normalizedPath,
        segments,
        tokens,
        lastSegment: segments.at(-1) ?? normalizedPath,
    };
}

function scoreComparablePagePaths(
    inputPath: ComparablePagePath,
    candidatePath: ComparablePagePath
): number {
    const fullPathSimilarity = getLevenshteinSimilarity(inputPath.path, candidatePath.path);
    const segmentSimilarity = getAlignedSegmentSimilarity(
        inputPath.segments,
        candidatePath.segments
    );
    const lastSegmentSimilarity = getLevenshteinSimilarity(
        inputPath.lastSegment,
        candidatePath.lastSegment
    );
    const tokenOverlap = getJaccardSimilarity(inputPath.tokens, candidatePath.tokens);

    let score =
        fullPathSimilarity * 0.4 +
        segmentSimilarity * 0.3 +
        lastSegmentSimilarity * 0.2 +
        tokenOverlap * 0.1;

    if (
        candidatePath.path &&
        (inputPath.path.startsWith(`${candidatePath.path}/`) ||
            candidatePath.path.startsWith(`${inputPath.path}/`))
    ) {
        score += 0.05;
    }

    if (inputPath.lastSegment && inputPath.lastSegment === candidatePath.lastSegment) {
        score += 0.1;
    }

    return score;
}

function getAlignedSegmentSimilarity(left: string[], right: string[]): number {
    const length = Math.max(left.length, right.length);
    if (length === 0) {
        return 1;
    }

    let score = 0;
    for (let index = 0; index < length; index += 1) {
        score += getLevenshteinSimilarity(left[index] ?? '', right[index] ?? '');
    }

    return score / length;
}

function getJaccardSimilarity(left: string[], right: string[]): number {
    const leftSet = new Set(left);
    const rightSet = new Set(right);
    const union = new Set([...leftSet, ...rightSet]);

    if (union.size === 0) {
        return 1;
    }

    let intersection = 0;
    for (const token of leftSet) {
        if (rightSet.has(token)) {
            intersection += 1;
        }
    }

    return intersection / union.size;
}

function getLevenshteinSimilarity(left: string, right: string): number {
    if (left === right) {
        return 1;
    }

    const maxLength = Math.max(left.length, right.length);
    if (maxLength === 0) {
        return 1;
    }

    return 1 - leven(left, right) / maxLength;
}

function resolvePageDocument(
    page: RevisionPage,
    ancestors: AncestorRevisionPage[]
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    if (page.type === RevisionPageType.Group) {
        const firstDocument = resolveFirstDocument(page.pages, [...ancestors, page]);
        if (firstDocument) {
            return firstDocument;
        }

        return;
    }
    if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
        return undefined;
    }

    return { page, ancestors };
}

/**
 * Flatten a list of pages into a list of page documents.
 */
function flattenPages(
    pages: RevisionPage[],
    filter?: (page: RevisionPageDocument | RevisionPageGroup) => boolean
): RevisionPageDocument[] {
    const result: RevisionPageDocument[] = [];
    for (const page of pages) {
        if (page.type === RevisionPageType.Link || page.type === RevisionPageType.Computed) {
            continue;
        }

        if (filter && !filter(page)) {
            continue;
        }

        if (page.type === RevisionPageType.Document) {
            result.push(page);
        }
        result.push(...flattenPages(page.pages, filter));
    }

    return result;
}

/**
 * Extract the page path from a URL relative to a base URL.
 * Returns the path segment after the base, or undefined if the URL doesn't match.
 */
export function extractPagePath(url: string, baseURL: string): string | undefined {
    const urlPath = getURLPathname(url);
    const basePath = getURLPathname(baseURL);

    if (urlPath === undefined || basePath === undefined) {
        return undefined;
    }

    // When basePath is empty, the site is at the root of the domain, so any path matches
    if (basePath === '' || urlPath.startsWith(`${basePath}/`) || urlPath === basePath) {
        return removeLeadingSlash(urlPath.slice(basePath.length));
    }
}

/**
 * Parse a URL and return its pathname.
 */
function getURLPathname(url: string): string | undefined {
    if (!URL.canParse(url)) {
        return undefined;
    }

    return removeTrailingSlash(new URL(url).pathname);
}
