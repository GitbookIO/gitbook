import {
    getSpace,
    getCurrentRevision,
    getSpaceCustomization,
    getCollectionSpaces,
    getCollection,
} from '@/lib/api';

import { resolvePagePath, resolvePageId } from '@/lib/pages';
import { ContentVisibility, Space } from '@gitbook/api';

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
 * Fetch all the data needed to render the content.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const { spaceId } = params;

    const [space, revision, customization] = await Promise.all([
        getSpace(spaceId),
        getCurrentRevision(spaceId),
        getSpaceCustomization(spaceId),
    ]);

    const collection = await fetchParentCollection(space);
    const page =
        'pageId' in params && params.pageId
            ? resolvePageId(revision, params.pageId)
            : resolvePagePath(revision, getPagePath(params));

    return {
        space,
        revision,
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
export function getPagePath(params: PagePathParams): string {
    const { pathname } = params;
    return pathname ? pathname.join('/') : '';
}
