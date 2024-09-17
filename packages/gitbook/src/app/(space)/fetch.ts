import { ContentVisibility, RevisionPage, Space } from '@gitbook/api';
import { headers } from 'next/headers';

import {
    getCollectionSpaces,
    getCollection,
    ContentPointer,
    getRevisionPageByPath,
    getDocument,
    getSpaceData,
    ContentTarget,
    SiteContentPointer,
    getCurrentSiteData,
    getSite,
    getSiteSpaces,
    getCurrentSiteCustomization,
} from '@/lib/api';
import { resolvePagePath, resolvePageId } from '@/lib/pages';

export interface PagePathParams {
    pathname?: string[];
}

export interface PageIdParams {
    pageId: string;
}

/**
 * Get the current content pointer from the params.
 */
export function getContentPointer(): ContentPointer | SiteContentPointer {
    const headerSet = headers();
    const spaceId = headerSet.get('x-gitbook-content-space');
    if (!spaceId) {
        throw new Error(
            'getContentPointer is called outside the scope of a request processed by the middleware',
        );
    }

    const siteId = headerSet.get('x-gitbook-content-site');
    if (siteId) {
        const organizationId = headerSet.get('x-gitbook-content-organization');
        const siteSpaceId = headerSet.get('x-gitbook-content-site-space');
        const siteShareKey = headerSet.get('x-gitbook-content-site-share-key');
        if (!organizationId) {
            throw new Error('Missing site content headers');
        }

        const siteContent: SiteContentPointer = {
            siteId,
            spaceId,
            siteSpaceId: siteSpaceId ?? undefined,
            siteShareKey: siteShareKey ?? undefined,
            organizationId,
            revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
            changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
        };
        return siteContent;
    } else {
        const content: ContentPointer = {
            spaceId,
            revisionId: headerSet.get('x-gitbook-content-revision') ?? undefined,
            changeRequestId: headerSet.get('x-gitbook-content-changerequest') ?? undefined,
        };
        return content;
    }
}

/**
 * Fetch all the data needed to render the space layout.
 */
export async function fetchSpaceData() {
    const content = getContentPointer();

    const siteShareKey = 'siteId' in content ? content.siteShareKey : undefined;

    const [{ space, contentTarget, pages, customization, scripts }, parentSite] = await Promise.all(
        'siteId' in content
            ? [
                  getCurrentSiteData(content),
                  fetchParentSite({
                      organizationId: content.organizationId,
                      siteId: content.siteId,
                      siteShareKey,
                  }),
              ]
            : [getSpaceData(content, siteShareKey)],
    );

    const parent = await (parentSite ?? fetchParentCollection(space));
    const spaceRelativeToParent = parent?.spaces.find((space) => space.id === content.spaceId);

    return {
        content,
        contentTarget,
        space: spaceRelativeToParent ?? space,
        pages,
        customization,
        scripts,
        ancestors: [],
        ...parent,
    };
}

/**
 * Fetch all the data needed to render the content.
 * Optimized to fetch in parallel as much as possible.
 */
export async function fetchPageData(params: PagePathParams | PageIdParams) {
    const content = getContentPointer();
    const siteShareKey = 'siteId' in content ? content.siteShareKey : undefined;
    const { space, contentTarget, pages, customization, scripts } = await ('siteId' in content
        ? getCurrentSiteData(content)
        : getSpaceData(content, siteShareKey));

    const page = await resolvePage(contentTarget, pages, params);
    const [parent, document] = await Promise.all([
        'siteId' in content
            ? fetchParentSite({
                  organizationId: content.organizationId,
                  siteId: content.siteId,
                  siteShareKey: content.siteShareKey,
              })
            : fetchParentCollection(space),
        page?.page.documentId ? getDocument(space.id, page.page.documentId) : null,
    ]);

    return {
        content,
        contentTarget,
        space,
        pages,
        customization,
        scripts,
        ancestors: [],
        ...page,
        ...parent,
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

async function fetchParentCollection(space: Space) {
    const parentCollectionId =
        space.visibility === ContentVisibility.InCollection ? space.parent : undefined;
    const [collection, spaces] = await Promise.all([
        parentCollectionId ? getCollection(parentCollectionId) : null,
        parentCollectionId ? getCollectionSpaces(parentCollectionId) : ([] as Space[]),
    ]);

    return { parent: collection, spaces };
}

async function fetchParentSite(args: {
    organizationId: string;
    siteId: string;
    siteShareKey: string | undefined;
}) {
    const { organizationId, siteId, siteShareKey } = args;
    const [site, siteSpaces, siteParentCustomizations] = await Promise.all([
        getSite(organizationId, siteId),
        getSiteSpaces({ organizationId, siteId, siteShareKey }),
        siteId ? getCurrentSiteCustomization({ organizationId, siteId }) : null,
    ]);

    const spaces: Record<string, Space> = {};
    siteSpaces.forEach((siteSpace) => {
        spaces[siteSpace.space.id] = {
            ...siteSpace.space,
            title: siteSpace.title ?? siteSpace.space.title,
            urls: {
                ...siteSpace.space.urls,
                published: siteSpace.urls.published,
            },
        };
    });

    // override the title with the customization title
    const parent = {
        ...site,
        ...(siteParentCustomizations?.title ? { title: siteParentCustomizations.title } : {}),
    };

    return {
        parent,
        spaces: Object.values(spaces),
    };
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
