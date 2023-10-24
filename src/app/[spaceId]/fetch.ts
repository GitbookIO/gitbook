import { api } from '@/lib/api';
import { Revision, RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

export interface SpaceParams {
    spaceId: string;
}

export interface PagePathParams extends SpaceParams {
    pathname?: string[];
}

export interface PageIdParams extends SpaceParams {
    pageId?: string;
}

type AncestorRevisionPage = RevisionPageDocument | RevisionPageGroup;

/**
 * Fetch all the data needed for the page.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const { spaceId } = params;

    const [{ data: space }, { data: revision }] = await Promise.all([
        api().spaces.getSpaceById(spaceId),
        api().spaces.getCurrentRevision(spaceId),
    ]);

    const page =
        'pageId' in params && params.pageId
            ? resolvePageId(revision, params.pageId)
            : resolvePagePath(revision, getPagePath(params));

    return {
        space,
        revision,
        ancestors: [],
        ...page,
    };
}

/**
 * Get the page path from the params.
 */
export function getPagePath(params: PagePathParams): string {
    const { pathname } = params;
    return pathname ? pathname.join('/') : '';
}

/**
 * Resolve a page path to a page document.
 */
function resolvePagePath(
    revision: Revision,
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
        const firstPage = resolveFirstDocument(revision.pages, []);
        if (!firstPage) {
            return undefined;
        }

        return firstPage;
    }

    return iteratePages(revision.pages, []);
}

function resolvePageId(
    revision: Revision,
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
    return iteratePages(revision.pages, []);
}

function resolveFirstDocument(
    pages: RevisionPage[],
    ancestors: AncestorRevisionPage[],
): { page: RevisionPageDocument; ancestors: AncestorRevisionPage[] } | undefined {
    for (const page of pages) {
        if (page.type === 'link') {
            continue;
        }

        return resolvePageDocument(page, ancestors);
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
