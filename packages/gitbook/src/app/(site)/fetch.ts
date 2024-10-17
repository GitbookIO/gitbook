import { RevisionPage, SiteSpace, Space } from '@gitbook/api';

import {
    getRevisionPageByPath,
    getDocument,
    ContentTarget,
    getSiteData,
    getSite,
    getCurrentSiteCustomization,
    getSiteStructure,
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

    const [{ space, contentTarget, pages, customization, scripts }, siteStructure] =
        await Promise.all([
            getSiteData(content),
            fetchSiteStructure({
                organizationId: content.organizationId,
                siteId: content.siteId,
                siteShareKey: content.siteShareKey,
                siteSpaceId: content.siteSpaceId,
            }),
        ]);

    const site = siteStructure.site;
    const spaces = siteStructure.spaces;
    const sections = siteStructure.sections;

    // we grab the space attached to the parent as it contains overriden customizations
    const spaceRelativeToParent = spaces.find((space) => space.id === content.spaceId);

    return {
        content,
        contentTarget,
        space: spaceRelativeToParent ?? space,
        pages,
        sections,
        section: siteStructure.section,
        site,
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
    const content = getSiteContentPointer();

    const { space, contentTarget, pages, customization, scripts } = await getSiteData(content);
    const page = await resolvePage(contentTarget, pages, params);
    const [siteStructure, document] = await Promise.all([
        fetchSiteStructure({
            organizationId: content.organizationId,
            siteId: content.siteId,
            siteShareKey: content.siteShareKey,
            siteSpaceId: content.siteSpaceId,
        }),
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
        ...siteStructure,
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
 * Fetch the structure of an organization site.
 * This includes the site and its sections and spaces.
 */
async function fetchSiteStructure(args: {
    organizationId: string;
    siteId: string;
    siteShareKey: string | undefined;
    siteSpaceId: string | undefined;
}) {
    const { organizationId, siteId, siteSpaceId} = args;
    const [orgSite, siteStructure, siteParentCustomizations] = await Promise.all([
        getSite(organizationId, siteId),
        getSiteStructure({ organizationId, siteId }),
        getCurrentSiteCustomization({ organizationId, siteId, siteSpaceId: undefined }),
    ]);

    const siteSections = siteStructure.type === 'sections' && siteStructure.structure ? siteStructure.structure : [];

    const section = siteSections.find(section => section.id === siteSpaceId || section.siteSpaces.find(siteSpace => siteSpace.id === siteSpaceId));

    const siteSpaces: SiteSpace[] = siteStructure.type === 'siteSpaces' && siteStructure.structure ? siteStructure.structure : section?.siteSpaces ?? [];
   
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
    const site = {
        ...orgSite,
        ...(siteParentCustomizations?.title ? { title: siteParentCustomizations.title } : {}),
    };

    return {
        site,
        spaces: Object.values(spaces),
        sections: siteSections,
        section
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
