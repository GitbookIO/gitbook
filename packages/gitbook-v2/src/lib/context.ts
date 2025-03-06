import { getSiteStructureSections } from '@/lib/sites';
import type {
    ChangeRequest,
    PublishedSiteContentLookup,
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
import { type GitBookDataFetcher, createDataFetcher, throwIfDataError } from '@v2/lib/data';
import { redirect } from 'next/navigation';
import { assert } from 'ts-essentials';
import { GITBOOK_API_TOKEN, GITBOOK_API_URL, GITBOOK_URL } from './env';
import { type ImageResizer, createImageResizer } from './images';
import { type GitBookSpaceLinker, createLinker } from './links';

/**
 * Generic context when rendering content.
 */
export type GitBookBaseContext = {
    /**
     * Data fetcher to fetch data from GitBook.
     */
    dataFetcher: GitBookDataFetcher;

    /**
     * Linker to generate links in the current space.
     */
    linker: GitBookSpaceLinker;

    /**
     * Image resizer to resize images.
     */
    imageResizer?: ImageResizer;
};

/**
 * Any context when rendering content.
 */
export type GitBookAnyContext = GitBookSpaceContext | GitBookSiteContext | GitBookPageContext;

/**
 * Context when rendering a space content.
 */
export type GitBookSpaceContext = GitBookBaseContext & {
    organizationId: string;

    space: Space;
    changeRequest: ChangeRequest | null;

    /** ID of the current revision. */
    revisionId: string;

    /** Pages of the space. */
    pages: RevisionPage[];

    /** Share key of the space. */
    shareKey: string | undefined;
};

export type SiteSections = {
    list: (SiteSectionGroup | SiteSection)[];
    current: SiteSection;
};

/**
 * Context when rendering a site.
 */
export type GitBookSiteContext = GitBookSpaceContext & {
    site: Site;

    /** Current site space. */
    siteSpace: SiteSpace;

    /** All site spaces in the current section / or entire site */
    siteSpaces: SiteSpace[];

    /** Sections of the site. */
    sections: null | SiteSections;

    /** Customizations of the site. */
    customization: SiteCustomizationSettings;

    /** Structure of the site. */
    structure: SiteStructure;

    /** Scripts to load for the site. */
    scripts: SiteIntegrationScript[];
};

/**
 * Context when rendering a page.
 */
export type GitBookPageContext = (GitBookSpaceContext | GitBookSiteContext) & {
    page: RevisionPageDocument;
};

/**
 * Get the base context for a request.
 */
export function getBaseContext(input: {
    siteURL: URL | string;
    urlMode: 'url' | 'url-host';
    apiToken?: string | null;
}) {
    const url = typeof input.siteURL === 'string' ? new URL(input.siteURL) : input.siteURL;
    const urlMode = input.urlMode;

    const dataFetcher = createDataFetcher({
        apiToken: input.apiToken ?? GITBOOK_API_TOKEN,
        apiEndpoint: GITBOOK_API_URL,
    });
    const gitbookURL = GITBOOK_URL ? new URL(GITBOOK_URL) : undefined;

    const linker =
        urlMode === 'url-host'
            ? createLinker({
                  host: url.host,
                  pathname: url.pathname,
              })
            : createLinker({
                  protocol: gitbookURL?.protocol,
                  host: gitbookURL?.host,
                  pathname: `/url/${url.host}${url.pathname}`,
              });

    if (urlMode === 'url') {
        // Create link in the same format for links to other sites/sections.
        linker.toLinkForContent = (rawURL: string) => {
            const urlObject = new URL(rawURL);
            return `/url/${urlObject.host}${urlObject.pathname}`;
        };
    }

    const imageResizer = createImageResizer({
        host: url.host,
        // To ensure image resizing work for proxied sites,
        // we serve images from the root of the site.
        linker: linker,
    });

    return {
        dataFetcher,
        linker,
        imageResizer,
    };
}

/**
 * Fetch the context of a site for a given URL and a base context.
 */
export async function fetchSiteContextByURL(
    baseContext: GitBookBaseContext,
    input: {
        url: string;
        visitorAuthToken: string | null;
        redirectOnError: boolean;
    }
): Promise<GitBookSiteContext> {
    const { dataFetcher } = baseContext;
    const data = await throwIfDataError(
        dataFetcher.getPublishedContentByUrl({
            url: input.url,
            visitorAuthToken: input.visitorAuthToken,
            redirectOnError: input.redirectOnError,
        })
    );

    return fetchSiteContextByURLLookup(baseContext, data);
}

/**
 * Fetch the context of a site using the resolution of a URL
 */
export async function fetchSiteContextByURLLookup(
    baseContext: GitBookBaseContext,
    data: PublishedSiteContentLookup
): Promise<GitBookSiteContext> {
    const { dataFetcher } = baseContext;
    if ('redirect' in data) {
        redirect(data.redirect);
    }

    return await fetchSiteContextByIds(
        {
            ...baseContext,
            dataFetcher: dataFetcher.withToken({
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
        }
    );
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
        siteSpace: string | undefined;
        space: string;
        shareKey: string | undefined;
        changeRequest: string | undefined;
        revision: string | undefined;
    }
): Promise<GitBookSiteContext> {
    const { dataFetcher } = baseContext;

    const [{ site: orgSite, structure: siteStructure, customizations, scripts }, spaceContext] =
        await Promise.all([
            throwIfDataError(
                dataFetcher.getPublishedContentSite({
                    organizationId: ids.organization,
                    siteId: ids.site,
                    siteShareKey: ids.shareKey,
                })
            ),
            fetchSpaceContextByIds(baseContext, ids),
        ]);

    // override the title with the customization title
    // TODO: remove this hack once we have a proper way to handle site customizations
    const site = {
        ...orgSite,
        ...(customizations.site?.title ? { title: customizations.site.title } : {}),
    };

    const sections = ids.siteSection
        ? parseSiteSectionsAndGroups(siteStructure, ids.siteSection)
        : null;

    const siteSpace = (
        siteStructure.type === 'siteSpaces' && siteStructure.structure
            ? siteStructure.structure
            : sections?.current.siteSpaces
    )?.find((siteSpace) => siteSpace.id === ids.siteSpace);
    if (!siteSpace) {
        throw new Error('Site space not found');
    }

    const siteSpaces =
        siteStructure.type === 'siteSpaces'
            ? siteStructure.structure
            : (sections?.current.siteSpaces ?? []);

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
        siteSpaces,
        siteSpace,
        customization,
        structure: siteStructure,
        sections,
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
    }
): Promise<GitBookSpaceContext> {
    const { dataFetcher } = baseContext;

    const [space, changeRequest] = await Promise.all([
        throwIfDataError(
            dataFetcher.getSpace({
                spaceId: ids.space,
                shareKey: ids.shareKey,
            })
        ),
        ids.changeRequest
            ? throwIfDataError(
                  dataFetcher.getChangeRequest({
                      spaceId: ids.space,
                      changeRequestId: ids.changeRequest,
                  })
              )
            : null,
    ]);

    const revisionId = changeRequest?.revision ?? ids.revision ?? space.revision;

    const pages = await throwIfDataError(
        dataFetcher.getRevisionPages({
            spaceId: ids.space,
            revisionId,
            // We only care about the Git metadata when the Git sync is enabled,
            // otherwise we can optimize performance by not fetching it
            metadata: !!space.gitSync,
        })
    );

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
 * Check if the context is the root one for a site.
 * Meaning we are on the default section / space.
 */
export function checkIsRootSiteContext(context: GitBookSiteContext): boolean {
    const { structure } = context;
    switch (structure.type) {
        case 'sections': {
            return getSiteStructureSections(structure, { ignoreGroups: true }).some(
                (structure) =>
                    structure.default &&
                    structure.id === context.sections?.current.id &&
                    structure.siteSpaces.some(
                        (siteSpace) => siteSpace.default && siteSpace.id === context.siteSpace.id
                    )
            );
        }
        case 'siteSpaces': {
            return structure.structure.some(
                (siteSpace) => siteSpace.default && siteSpace.id === context.siteSpace.id
            );
        }
    }
}

function parseSiteSectionsAndGroups(structure: SiteStructure, siteSectionId: string) {
    const sectionsAndGroups = getSiteStructureSections(structure, { ignoreGroups: false });
    const section = parseCurrentSection(structure, siteSectionId);
    assert(section, 'A section must be defined when there are multiple sections');
    return { list: sectionsAndGroups, current: section } satisfies SiteSections;
}

function parseCurrentSection(structure: SiteStructure, siteSectionId: string) {
    const sections = getSiteStructureSections(structure, { ignoreGroups: true });
    return sections.find((section) => section.id === siteSectionId);
}
