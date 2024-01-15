import { ContentVisibility, RevisionPage, Space } from '@gitbook/api';
import { headers } from 'next/headers';

import {
    getCollectionSpaces,
    getCollection,
    ContentPointer,
    getSpaceContent,
    getRevisionPageByPath,
    getDocument,
} from '@/lib/api';
import { resolvePagePath, resolvePageId } from '@/lib/pages';

export interface SpaceParams {
    spaceId: string;
}

export interface PagePathParams extends SpaceParams {
    pathname?: string[];
}

export interface PageIdParams extends SpaceParams {
    pageId?: string;
}

/**
 * Get the current content pointer from the params.
 */
export function getContentPointer(params: PagePathParams | PageIdParams) {
    const headerSet = headers();
    const content: ContentPointer = {
        spaceId: params.spaceId,
        revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
        changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
    };

    return content;
}

/**
 * Fetch all the data needed to render the space layout.
 */
export async function fetchSpaceData(params: PagePathParams | PageIdParams) {
    const content = getContentPointer(params);
    const { space, pages, customization, scripts } = await getSpaceContent(content);
    const collection = await fetchParentCollection(space);

    return {
        content,
        space,
        pages,
        customization,
        scripts,
        ancestors: [],
        ...collection,
    };
}

/**
 * Fetch all the data needed to render the content.
 * Optimized to fetch in parallel as much as possible.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const content = getContentPointer(params);
    const { space, pages, customization, scripts } = await getSpaceContent(content);

    const page = await resolvePage(pages, content, params);
    const [collection, document] = await Promise.all([
        fetchParentCollection(space),
        page?.page.documentId ? getDocument(space.id, page.page.documentId) : null,
    ]);

    return {
        content,
        space,
        pages,
        customization,
        scripts,
        ancestors: [],
        ...page,
        ...collection,
        document,
    };
}

/**
 * Resolve a page from the params.
 * If the path can't be found, we try to resolve it from the API to handle redirects.
 */
async function resolvePage(
    pages: RevisionPage[],
    content: ContentPointer,
    params: PagePathParams | PageIdParams,
) {
    if ('pageId' in params && params.pageId) {
        return resolvePageId(pages, params.pageId);
    }

    const pathParam = getPathnameParam(params);
    const page = resolvePagePath(pages, pathParam);
    if (page) {
        return page;
    }

    // If page can't be found, we try with the API, in case we have a redirect
    const resolved = await getRevisionPageByPath(content, pathParam);
    if (resolved) {
        return resolvePageId(pages, resolved.id);
    }

    return undefined;
}

async function fetchParentCollection(space: Space) {
    const parentCollectionId =
        space.visibility === ContentVisibility.InCollection ? space.parent : undefined;
    const [collection, collectionSpaces] = await Promise.all([
        parentCollectionId ? getCollection(parentCollectionId) : null,
        parentCollectionId ? getCollectionSpaces(parentCollectionId) : ([] as Space[]),
    ]);

    return { collection, collectionSpaces };
}

/**
 * Get the page path from the params.
 */
export function getPathnameParam(params: PagePathParams): string {
    const { pathname } = params;
    return pathname ? pathname.map((part) => decodeURIComponent(part)).join('/') : '';
}
