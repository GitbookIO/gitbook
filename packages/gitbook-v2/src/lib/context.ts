import {
    ChangeRequest,
    RevisionPage,
    RevisionPageDocument,
    Site,
    SiteCustomizationSettings,
    SiteIntegrationScript,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
    SiteStructure,
    Space,
} from '@gitbook/api';
import { redirect } from 'next/navigation';
import { assert } from 'ts-essentials';
import { createDataFetcher, GitBookDataFetcher } from '@v2/lib/data';
import { GitBookSpaceLinker, appendPrefixToLinker } from './links';

/**
 * Generic context when rendering content.
 */
export interface GitBookBaseContext {
    /**
     * Data fetcher to fetch data from GitBook.
     */
    dataFetcher: GitBookDataFetcher;

    /**
     * Linker to generate links in the current space.
     */
    linker: GitBookSpaceLinker;
}

/**
 * Any context when rendering content.
 */
export type GitBookAnyContext = GitBookSpaceContext | GitBookPageContext | GitBookSiteContext;

/**
 * Context when rendering a space content.
 */
export interface GitBookSpaceContext extends GitBookBaseContext {
    organizationId: string;

    space: Space;
    changeRequest: ChangeRequest | null;

    /** ID of the current revision. */
    revisionId: string;

    /** Pages of the space. */
    pages: RevisionPage[];

    /** Share key of the space. */
    shareKey: string | undefined;
}

/**
 * Context when rendering a page.
 */
export interface GitBookPageContext extends GitBookSpaceContext {
    page: RevisionPageDocument;
}

export interface SiteSections {
    list: (SiteSectionGroup | SiteSection)[];
    current: SiteSection;
}

/**
 * Context when rendering a site.
 */
export interface GitBookSiteContext extends GitBookSpaceContext {
    site: Site;
    sections: null | SiteSections;
    customization: SiteCustomizationSettings;
    structure: SiteStructure;
    spaces: Space[];
    scripts: SiteIntegrationScript[];
}

/**
 * Fetch the context of a site for a given URL and a base context.
 */
export async function fetchSiteContext(
    baseContext: GitBookBaseContext,
    input: {
        url: string;
        visitorAuthToken: string | undefined;
    },
): Promise<GitBookSiteContext> {
    const { dataFetcher } = baseContext;
    const data = await dataFetcher.getPublishedContentByUrl({
        url: input.url,
        visitorAuthToken: input.visitorAuthToken,
    });

    if ('redirect' in data) {
        redirect(data.redirect);
    }

    const context = await fetchSiteContextByIds(
        {
            ...baseContext,
            dataFetcher: createDataFetcher({
                apiEndpoint: dataFetcher.apiEndpoint,
                apiToken: data.apiToken,
            }),
        },
        {
            organization: data.organization,
            site: data.site,
            siteSection: data.siteSection,
            siteSpace: data.siteSpace,
            space: data.space,
            shareKey: data.shareKey,
            changeRequest: data.changeRequest,
            revision: data.revision,
        },
    );

    return {
        ...context,
        linker: appendPrefixToLinker(context.linker, data.basePath),
    };
}

/**
 * Fetch a site context by IDs.
 */
export async function fetchSiteContextByIds(
    baseContext: GitBookBaseContext,
    ids: {
        organization: string;
        site: string;
        siteSection: string | undefined;
        siteSpace: string;
        space: string;
        shareKey: string | undefined;
        changeRequest: string | undefined;
        revision: string | undefined;
    },
): Promise<GitBookSiteContext> {
    const { dataFetcher } = baseContext;

    const [{ site: orgSite, structure: siteStructure, customizations, scripts }, spaceContext] =
        await Promise.all([
            dataFetcher.getPublishedContentSite({
                organizationId: ids.organization,
                siteId: ids.site,
                siteShareKey: ids.shareKey,
            }),
            fetchSpaceContextByIds(baseContext, ids),
        ]);

    const siteSectionsAndGroups =
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
        ...(customizations.site?.title ? { title: customizations.site.title } : {}),
    };

    const sections =
        ids.siteSection && siteSectionsAndGroups
            ? parseSiteSectionsList(ids.siteSection, siteSectionsAndGroups)
            : null;
    const spaces =
        siteSpaces ?? (sections ? parseSpacesFromSiteSpaces(sections.current.siteSpaces) : []);

    const customization = (() => {
        if (ids.siteSpace) {
            const siteSpaceSettings = customizations.siteSpaces[ids.siteSpace];
            if (siteSpaceSettings) {
                return siteSpaceSettings;
            }
            // We got the pointer from an API and customizations from another.
            // It's possible that the two are unsynced leading to not found customizations for the space.
            // It's better to fallback on customization of the site that displaying an error.
            console.warn('Customization not found for site space', ids.siteSpace);
        }
        return customizations.site;
    })();

    return {
        ...spaceContext,
        organizationId: ids.organization,
        site,
        customization,
        structure: siteStructure,
        sections,
        spaces,
        scripts,
    };
}

/**
 * Fetch a space context by IDs.
 */
export async function fetchSpaceContextByIds(
    baseContext: GitBookBaseContext,
    ids: {
        space: string;
        shareKey: string | undefined;
        changeRequest: string | undefined;
        revision: string | undefined;
    },
): Promise<GitBookSpaceContext> {
    const { dataFetcher } = baseContext;

    const [space, changeRequest] = await Promise.all([
        dataFetcher.getSpace({
            spaceId: ids.space,
            shareKey: ids.shareKey,
        }),
        ids.changeRequest
            ? dataFetcher.getChangeRequest({
                  spaceId: ids.space,
                  changeRequestId: ids.changeRequest,
              })
            : null,
    ]);

    const revisionId = changeRequest?.revision ?? ids.revision ?? space.revision;

    const pages = await dataFetcher.getRevisionPages({
        spaceId: ids.space,
        revisionId,
        // We only care about the Git metadata when the Git sync is enabled,
        // otherwise we can optimize performance by not fetching it
        metadata: !!space.gitSync,
    });

    return {
        ...baseContext,
        organizationId: space.organization,
        space,
        pages,
        changeRequest,
        revisionId,
        shareKey: ids.shareKey,
    };
}

/**
 * Parse the site spaces into a list of spaces with their title and urls.
 */
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

function parseSiteSectionsList(
    siteSectionId: string,
    sectionsAndGroups: (SiteSectionGroup | SiteSection)[],
) {
    const sections = sectionsAndGroups.flatMap((item) =>
        item.object === 'site-section-group' ? item.sections : item,
    );
    const section = sections.find((section) => section.id === siteSectionId);
    assert(section, 'A section must be defined when there are multiple sections');
    return { list: sectionsAndGroups, current: section } satisfies SiteSections;
}
