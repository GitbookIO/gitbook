import { ContentVisibility, Space } from '@gitbook/api';

import {
    getCollectionSpaces,
    getCollection,
    ContentPointer,
    getSpaceContent,
    getDocument,
} from '@/lib/api';
import { resolvePagePath, resolvePageId } from '@/lib/pages';

export type SpaceParams = ContentPointer;

export interface PagePathParams extends SpaceParams {
    pathname?: string[];
}

export interface PageIdParams extends SpaceParams {
    pageId?: string;
}

/**
 * Fetch all the data needed to render the content.
 * Optimized to fetch in parallel as much as possible.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const content: ContentPointer = {
        spaceId: params.spaceId,
        changeRequestId: params.changeRequestId,
        revisionId: params.revisionId,
    };

    const { space, pages, customization, scripts } = await getSpaceContent(content);

    const page =
        'pageId' in params && params.pageId
            ? resolvePageId(pages, params.pageId)
            : resolvePagePath(pages, getPathnameParam(params));

    const [collection, document] = await Promise.all([
        fetchParentCollection(space),
        page && page.page.documentId ? await getDocument(space.id, page.page.documentId) : null,
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
    return pathname ? pathname.join('/') : '';
}
