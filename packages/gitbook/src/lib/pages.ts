import {
    type Revision,
    type RevisionPage,
    type RevisionPageDocument,
    type RevisionPageGroup,
    RevisionPageType,
} from '@gitbook/api';

export type AncestorRevisionPage = RevisionPageDocument | RevisionPageGroup;

type ResolvedPagePath<Page extends RevisionPageDocument | RevisionPageGroup> = {
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
