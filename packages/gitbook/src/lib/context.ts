import {
    type GitBookDataFetcher,
    createDataFetcher,
    getDataOrNull,
    throwIfDataError,
} from '@/lib/data';
import { getLogger } from '@/lib/logger';
import { getSiteStructureSections } from '@/lib/sites';
import type {
    ChangeRequest,
    PublishedSiteContent,
    Revision,
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
import assertNever from 'assert-never';
import { notFound } from 'next/navigation';
import { assert } from 'ts-essentials';
import { GITBOOK_URL } from './env';
import { type ImageResizer, createImageResizer } from './images';
import { type GitBookLinker, createLinker, linkerForPublishedURL } from './links';

/**
 * Data about the site URL. Provided by the middleware.
 * These data are stable between pages in the same site space.
 */
export type SiteURLData = Pick<
    PublishedSiteContent,
    | 'organization'
    | 'apiToken'
    | 'site'
    | 'siteSpace'
    | 'space'
    | 'revision'
    | 'changeRequest'
    | 'shareKey'
    | 'siteSection'
    | 'siteBasePath'
    | 'basePath'
    | 'contextId'
> & {
    /**
     * Identifier used for image resizing.
     */
    imagesContextId: string;
};

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
    linker: GitBookLinker;

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

    /** Revision of the space. */
    revision: Revision;

    /** Identifier of the revision. Could be different than `revision.id` when using computed. */
    revisionId: string;

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

    /** Context ID used by adaptive content. It represents an unique identifier for the authentication context */
    contextId?: string;
};

/**
 * Context when rendering a page.
 */
export type GitBookPageContext = (GitBookSpaceContext | GitBookSiteContext) & {
    page: RevisionPageDocument;
};

/**
 * Get the base context for a request on a site.
 */
export function getBaseContext(input: {
    siteURL: URL | string;
    siteURLData: SiteURLData;
    urlMode: 'url' | 'url-host';
}) {
    const { urlMode, siteURLData } = input;
    const siteURL = typeof input.siteURL === 'string' ? new URL(input.siteURL) : input.siteURL;

    const dataFetcher = createDataFetcher({
        apiToken: siteURLData.apiToken ?? null,
    });

    const gitbookURL = GITBOOK_URL ? new URL(GITBOOK_URL) : undefined;
    const linker =
        urlMode === 'url-host'
            ? createLinker({
                  host: siteURL.host,
                  siteBasePath: siteURLData.siteBasePath,
                  spaceBasePath: siteURLData.basePath,
              })
            : createLinker({
                  protocol: gitbookURL?.protocol,
                  host: gitbookURL?.host,
                  siteBasePath: `/url/${siteURL.host}${siteURLData.siteBasePath}`,
                  spaceBasePath: `/url/${siteURL.host}${siteURLData.basePath}`,
              });

    if (urlMode === 'url') {
        // Create link in the same format for links to other sites/sections.
        linker.toLinkForContent = (rawURL: string) => {
            const urlObject = new URL(rawURL);
            return `/url/${urlObject.host}${urlObject.pathname}${urlObject.search}${urlObject.hash}`;
        };
    }

    const imageResizer = createImageResizer({
        imagesContextId: siteURLData.imagesContextId,
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
 * Fetch the context of a site using the resolution of a URL
 */
export async function fetchSiteContextByURLLookup(
    baseContext: GitBookBaseContext,
    data: SiteURLData
): Promise<GitBookSiteContext> {
    return fetchSiteContextByIds(baseContext, {
        organization: data.organization,
        site: data.site,
        siteSection: data.siteSection,
        siteSpace: data.siteSpace,
        space: data.space,
        shareKey: data.shareKey,
        changeRequest: data.changeRequest,
        revision: data.revision,
        contextId: data.contextId,
    });
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
        contextId?: string;
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

    // Parse the current siteSpace and siteSpaces based on the site structure type.
    const { siteSpaces, siteSpace }: { siteSpaces: SiteSpace[]; siteSpace: SiteSpace } = (() => {
        if (siteStructure.type === 'siteSpaces') {
            const siteSpaces = siteStructure.structure;
            const siteSpace = siteSpaces.find((siteSpace) => siteSpace.id === ids.siteSpace);

            if (!siteSpace) {
                throw new Error(
                    `Site space "${ids.siteSpace}" not found in structure type="siteSpaces"`
                );
            }

            return { siteSpaces, siteSpace };
        }

        if (siteStructure.type === 'sections') {
            assert(
                sections,
                `cannot find site space "${ids.siteSpace}" because parsed sections are missing siteStructure.type="sections" siteSection="${ids.siteSection}"`
            );

            const currentSection = sections.current;
            const siteSpaces = currentSection.siteSpaces;
            const siteSpace = currentSection.siteSpaces.find(
                (siteSpace) => siteSpace.id === ids.siteSpace
            );

            if (!siteSpace) {
                throw new Error(
                    `Site space "${ids.siteSpace}" not found in structure type="sections" currentSection="${currentSection.id}"`
                );
            }

            return { siteSpaces, siteSpace };
        }

        // @ts-expect-error
        assertNever(siteStructure, `cannot handle site structure of type ${siteStructure.type}`);
    })();

    const customization = (() => {
        if (ids.siteSpace) {
            const siteSpaceSettings = customizations.siteSpaces[ids.siteSpace];
            if (siteSpaceSettings) {
                return siteSpaceSettings;
            }

            const logger = getLogger().subLogger('fetchSiteContextByIds', {});
            // We got the pointer from an API and customizations from another.
            // It's possible that the two are unsynced leading to not found customizations for the space.
            // It's better to fallback on customization of the site that displaying an error.
            logger.warn('Customization not found for site space', ids.siteSpace);
        }

        return customizations.site;
    })();

    return {
        ...spaceContext,
        linker: site.urls.published
            ? linkerForPublishedURL(spaceContext.linker, site.urls.published)
            : spaceContext.linker,
        organizationId: ids.organization,
        site,
        siteSpaces,
        siteSpace,
        customization,
        structure: siteStructure,
        sections,
        scripts,
        contextId: ids.contextId,
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
            ? getDataOrNull(
                  dataFetcher.getChangeRequest({
                      spaceId: ids.space,
                      changeRequestId: ids.changeRequest,
                  })
              )
            : null,
    ]);

    if (ids.changeRequest && !changeRequest) {
        // When trying to render a change request with an invalid / non-existing ID,
        // we should return a 404.
        notFound();
    }

    const revisionId = ids.revision ?? changeRequest?.revision ?? space.revision;

    const revision = await getDataOrNull(
        dataFetcher.getRevision({
            spaceId: ids.space,
            revisionId,
        }),

        // When trying to render a revision with an invalid / non-existing ID,
        // we should handle gracefully the 404 and throw notFound.
        ids.revision ? [404] : undefined
    );
    if (!revision) {
        notFound();
    }

    return {
        ...baseContext,
        organizationId: space.organization,
        space,
        revision,
        revisionId,
        changeRequest,
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
    assert(section, `couldn't find section "${siteSectionId}" in site structure`);
    return { list: sectionsAndGroups, current: section } satisfies SiteSections;
}

function parseCurrentSection(structure: SiteStructure, siteSectionId: string) {
    const sections = getSiteStructureSections(structure, { ignoreGroups: true });
    return sections.find((section) => section.id === siteSectionId);
}
