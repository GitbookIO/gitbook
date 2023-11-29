import { ContentVisibility, Space } from '@gitbook/api';

import {
    getSpace,
    getSpaceCustomization,
    getCollectionSpaces,
    getCollection,
    ContentPointer,
    getRevisionPages,
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
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const { spaceId } = params;

    const content: ContentPointer = {
        spaceId: params.spaceId,
        changeRequestId: params.changeRequestId,
        revisionId: params.revisionId,
    };

    const [space, pages, customization] = await Promise.all([
        getSpace(spaceId),
        getRevisionPages(content),
        getSpaceCustomization(spaceId),
    ]);

    const collection = await fetchParentCollection(space);
    const page =
        'pageId' in params && params.pageId
            ? resolvePageId(pages, params.pageId)
            : resolvePagePath(pages, getPathnameParam(params));

    return {
        content,
        space,
        pages,
        customization,
        ancestors: [],
        ...page,
        ...collection,
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
