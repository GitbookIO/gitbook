import { Revision, RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

export type AncestorRevisionPage = RevisionPageDocument | RevisionPageGroup;

/**
 * Resolve a page path to a page document.
 */
export function resolvePagePath(
    rootPages: Revision['pages'],
    pagePath: string,
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    const iteratePages = (
        pages: RevisionPage[],
        ancestors: AncestorRevisionPage[],
    ): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined => {
        for (const page of pages) {
            if (page.type === 'link') {
                continue;
            }

            if (page.path !== pagePath) {
                if (page.path.split('/').join('/') === pagePath) {
                    return resolvePageDocument(page, ancestors);
                }

                // TODO: can be optimized to count the number of slashes and skip the entire subtree
                const result = iteratePages(page.pages, [...ancestors, page]);
                if (result) {
                    return result;
                }

                continue;
            }

            return resolvePageDocument(page, ancestors);
        }
    };

    if (!pagePath) {
        const firstPage = resolveFirstDocument(rootPages, []);
        if (!firstPage) {
            return undefined;
        }

        return firstPage;
    }

    return iteratePages(rootPages, []);
}

/**
 * Find a page by its ID in a revision.
 */
export function resolvePageId(
    rootPages: Revision['pages'],
    pageId: string,
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    const iteratePages = (
        pages: RevisionPage[],
        ancestors: AncestorRevisionPage[],
    ): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined => {
        for (const page of pages) {
            if (page.type === 'link') {
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
    page: RevisionPageDocument,
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
 * Resolve a page to its canonical path.
 * The path will NOT start with "/".
 */
export function getPagePath(
    rootPages: Revision['pages'],
    page: RevisionPageDocument | RevisionPageGroup,
): string {
    const firstPage = resolveFirstDocument(rootPages, []);

    if (firstPage && firstPage.page.id === page.id) {
        return '';
    }

    return page.path;
}

/**
 * Resolve the first page document in a list of pages.
 */
export function resolveFirstDocument(
    pages: RevisionPage[],
    ancestors: AncestorRevisionPage[],
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
    ancestors: AncestorRevisionPage[],
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    if (page.type === 'group') {
        const firstDocument = resolveFirstDocument(page.pages, [...ancestors, page]);
        if (firstDocument) {
            return firstDocument;
        }

        return;
    } else if (page.type === 'link') {
        return undefined;
    }

    return { page, ancestors };
}

/**
 * Flatten a list of pages into a list of page documents.
 */
function flattenPages(
    pages: RevisionPage[],
    filter?: (page: RevisionPageDocument | RevisionPageGroup) => boolean,
): RevisionPageDocument[] {
    const result: RevisionPageDocument[] = [];
    for (const page of pages) {
        if (page.type === 'link') {
            continue;
        }

        if (filter && !filter(page)) {
            continue;
        }

        if (page.type === 'document') {
            result.push(page);
        }
        result.push(...flattenPages(page.pages, filter));
    }

    return result;
}
