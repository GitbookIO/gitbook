import { RevisionPage, SiteSection, SiteSpace, Space } from '@gitbook/api';
import { assert } from 'ts-essentials';

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

type SectionsList = { list: SiteSection[]; section: SiteSection };

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
            }),
        ]);

    const site = siteStructure.site;

    const siteSections =
        content.siteSectionId && siteStructure.sections
            ? parseSiteSectionsList(content.siteSectionId, siteStructure.sections)
            : null;

    const spaces =
        siteStructure.spaces ??
        (siteSections ? parseSpacesFromSiteSpaces(siteSections.section.siteSpaces) : []);

    // we grab the space attached to the parent as it contains overriden customizations
    const spaceRelativeToParent = spaces?.find((space) => space.id === content.spaceId);

    return {
        content,
        contentTarget,
        space: spaceRelativeToParent ?? space,
        pages,
        sections: siteSections,
        site,
        spaces,
        customization,
        scripts,
        ancestors: [],
    };
}

function parseSiteSectionsList(siteSectionId: string, sections: SiteSection[]) {
    const section = sections.find((section) => section.id === siteSectionId);
    assert(sectionIsDefined(section), 'A section must be defined when there are multiple sections');
    return { list: sections, section } satisfies SectionsList;
}

function sectionIsDefined(section?: SiteSection): section is NonNullable<SiteSection> {
    return typeof section !== 'undefined' && section !== null;
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
 * This includes the site and its sections or spaces.
 */
async function fetchSiteStructure(args: {
    organizationId: string;
    siteId: string;
    siteShareKey: string | undefined;
}) {
    const { organizationId, siteId, siteShareKey } = args;
    const [orgSite, siteStructure, siteParentCustomizations] = await Promise.all([
        getSite(organizationId, siteId),
        getSiteStructure({ organizationId, siteId, siteShareKey }),
        getCurrentSiteCustomization({ organizationId, siteId, siteSpaceId: undefined }),
    ]);

    const siteSections =
        siteStructure.type === 'sections' && siteStructure.structure
            ? siteStructure.structure
            : null;
    const siteSpaces =
        siteStructure.type === 'siteSpaces' && siteStructure.structure
            ? parseSpacesFromSiteSpaces(siteStructure.structure)
            : null;

    // override the title with the customization title
    const site = {
        ...orgSite,
        ...(siteParentCustomizations?.title ? { title: siteParentCustomizations.title } : {}),
    };

    return {
        site,
        spaces: siteSpaces,
        sections: siteSections,
    };
}

function parseSpacesFromSiteSpaces(siteSpaces: SiteSpace[]) {
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
    return Object.values(spaces);
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
