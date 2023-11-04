import { getSpace, getCurrentRevision } from '@/lib/api';

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
 * Fetch all the data needed for the page.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const { spaceId } = params;

    const [space, revision] = await Promise.all([
        getSpace(spaceId),
        getCurrentRevision(spaceId),
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
