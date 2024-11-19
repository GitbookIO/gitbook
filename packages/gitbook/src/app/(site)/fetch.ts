import { RevisionPage } from '@gitbook/api';

import {
    getRevisionPageByPath,
    getDocument,
    ContentTarget,
    getSpaceContentData,
    getSiteData,
} from '@/lib/api';
import { resolvePagePath, resolvePageId } from '@/lib/pages';
import { getSiteContentPointer } from '@/lib/pointer';

export interface PagePathParams {
    pathname?: string[];
}

export interface PageIdParams {
    pageId: string;
}

/**
 * Fetch all the data needed to render the content layout.
 */
export async function fetchContentData() {
    const content = getSiteContentPointer();

    const [{ space, contentTarget, pages }, { customization, site, sections, spaces, scripts }] =
        await Promise.all([
            getSpaceContentData(content, content.siteShareKey),
            getSiteData(content),
        ]);

    // we grab the space attached to the parent as it contains overriden customizations
    const spaceRelativeToParent = spaces?.find((space) => space.id === content.spaceId);

    return {
        content,
        contentTarget,
        space: spaceRelativeToParent ?? space,
        pages,
        site,
        sections,
        spaces,
        customization,
        scripts,
        ancestors: [],
    };
}

/**
 * Fetch all the data needed to render the content.
 * Optimized to fetch in parallel as much as possible.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const contentData = await fetchContentData();

    const page = await resolvePage(contentData.contentTarget, contentData.pages, params);
    const document = page?.page.documentId
        ? await getDocument(contentData.space.id, page.page.documentId)
        : null;

    return {
        ...contentData,
        ...page,
        document,
    };
}

/**
 * Resolve a page from the params.
 * If the path can't be found, we try to resolve it from the API to handle redirects.
 */
async function resolvePage(
    contentTarget: ContentTarget,
    pages: RevisionPage[],
    params: PagePathParams | PageIdParams,
) {
    if ('pageId' in params) {
        return resolvePageId(pages, params.pageId);
    }

    const rawPathname = getPathnameParam(params);
    const pathname = normalizePathname(rawPathname);

    // When resolving a page, we use the lowercased pathname
    const page = resolvePagePath(pages, pathname);
    if (page) {
        return page;
    }

    // If page can't be found, we try with the API, in case we have a redirect
    // We use the raw pathname to handle special/malformed redirects setup by users in the GitSync.
    // The page rendering will take care of redirecting to a normalized pathname.
    //
    // We don't test path that are too long as GitBook doesn't support them and will return a 404 anyway.
    if (rawPathname.length <= 512) {
        const resolved = await getRevisionPageByPath(
            contentTarget.spaceId,
            contentTarget.revisionId,
            rawPathname,
        );
        if (resolved) {
            return resolvePageId(pages, resolved.id);
        }
    }

    return undefined;
}

/**
 * Get the page path from the params.
 */
export function getPathnameParam(params: PagePathParams): string {
    const { pathname } = params;
    return pathname ? pathname.map((part) => decodeURIComponent(part)).join('/') : '';
}

/**
 * Normalize the URL pathname into the format used in the revision page path.
 */
export function normalizePathname(pathname: string) {
    return pathname.toLowerCase();
}
