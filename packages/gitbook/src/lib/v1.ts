import {
    type GitBookBaseContext,
    type GitBookSiteContext,
    fetchSiteContextByIds,
    fetchSpaceContextByIds,
} from '@v2/lib/context';
import type { GitBookDataFetcher } from '@v2/lib/data/types';
import { createImageResizer } from '@v2/lib/images';
import { createLinker } from '@v2/lib/links';

import { DataFetcherError, wrapDataFetcherError } from '@v2/lib/data';
import {
    type SiteContentPointer,
    type SpaceContentPointer,
    api,
    getChangeRequest,
    getComputedDocument,
    getDocument,
    getEmbedByUrlInSpace,
    getLatestOpenAPISpecVersionContent,
    getPublishedContentSite,
    getReusableContent,
    getRevision,
    getRevisionFile,
    getRevisionPageByPath,
    getRevisionPages,
    getSiteRedirectBySource,
    getSpace,
    getUserById,
    renderIntegrationUi,
    searchSiteContent,
} from './api';
import { getDynamicCustomizationSettings } from './customization';
import { getBasePath, getHost, getSiteBasePath } from './links';

/*
 * Code that will be used until the migration to v2 is complete.
 */

/**
 * Get the base context for the V1.
 */
export async function getV1BaseContext(): Promise<GitBookBaseContext> {
    const host = await getHost();
    const basePath = await getBasePath();
    const siteBasePath = await getSiteBasePath();

    const linker = createLinker({
        host,
        spaceBasePath: basePath,
        siteBasePath: siteBasePath,
    });

    // On V1, we use hard-navigation between different spaces because of layout issues
    linker.toLinkForContent = (url) => {
        return url;
    };

    const dataFetcher = await getDataFetcherV1();

    const imageResizer = createImageResizer({
        imagesContextId: host,
        // In V1, we always resize at the top level of the hostname, not relative to the content.
        linker: createLinker({
            host,
            spaceBasePath: '/',
            siteBasePath: '/',
        }),
    });

    return {
        linker,
        dataFetcher,
        imageResizer,
    };
}

/**
 * Data fetcher that uses the old code of the v1.
 * Try not to use this as much as possible, and instead take the data fetcher from the props.
 * This data fetcher should only be used at the top of the tree.
 */
async function getDataFetcherV1(): Promise<GitBookDataFetcher> {
    const dataFetcher: GitBookDataFetcher = {
        async api() {
            const result = await api();
            return result.client;
        },

        withToken() {
            // In v1, the token is global and controlled by the middleware.
            // We don't need to do anything special here.
            return dataFetcher;
        },

        getUserById(userId) {
            return wrapDataFetcherError(async () => {
                const user = await getUserById(userId);
                if (!user) {
                    throw new DataFetcherError('User not found', 404);
                }

                return user;
            });
        },

        getPublishedContentSite(params) {
            return wrapDataFetcherError(async () => {
                return getPublishedContentSite(params);
            });
        },

        getSpace(params) {
            return wrapDataFetcherError(async () => {
                return getSpace(params.spaceId, params.shareKey);
            });
        },

        getChangeRequest(params) {
            return wrapDataFetcherError(async () => {
                const changeRequest = await getChangeRequest(
                    params.spaceId,
                    params.changeRequestId
                );
                if (!changeRequest) {
                    throw new DataFetcherError('Change request not found', 404);
                }

                return changeRequest;
            });
        },

        getRevision(params) {
            return wrapDataFetcherError(async () => {
                return getRevision(params.spaceId, params.revisionId, {
                    metadata: params.metadata,
                });
            });
        },

        getRevisionFile(params) {
            return wrapDataFetcherError(async () => {
                const revisionFile = await getRevisionFile(
                    params.spaceId,
                    params.revisionId,
                    params.fileId
                );
                if (!revisionFile) {
                    throw new DataFetcherError('Revision file not found', 404);
                }

                return revisionFile;
            });
        },

        getRevisionPageMarkdown() {
            throw new Error('Not implemented in v1');
        },

        getDocument(params) {
            return wrapDataFetcherError(async () => {
                const document = await getDocument(params.spaceId, params.documentId);
                if (!document) {
                    throw new DataFetcherError('Document not found', 404);
                }

                return document;
            });
        },

        getComputedDocument(params) {
            return wrapDataFetcherError(() => {
                return getComputedDocument(
                    params.organizationId,
                    params.spaceId,
                    params.source,
                    params.seed
                );
            });
        },

        getRevisionPages(params) {
            return wrapDataFetcherError(async () => {
                return getRevisionPages(params.spaceId, params.revisionId, {
                    metadata: params.metadata,
                });
            });
        },

        getRevisionPageByPath(params) {
            return wrapDataFetcherError(async () => {
                const revisionPage = await getRevisionPageByPath(
                    params.spaceId,
                    params.revisionId,
                    params.path
                );

                if (!revisionPage) {
                    throw new DataFetcherError('Revision page not found', 404);
                }

                return revisionPage;
            });
        },

        getReusableContent(params) {
            return wrapDataFetcherError(async () => {
                const reusableContent = await getReusableContent(
                    params.spaceId,
                    params.revisionId,
                    params.reusableContentId
                );

                if (!reusableContent) {
                    throw new DataFetcherError('Reusable content not found', 404);
                }

                return reusableContent;
            });
        },

        getLatestOpenAPISpecVersionContent(params) {
            return wrapDataFetcherError(async () => {
                const openAPISpecVersionContent = await getLatestOpenAPISpecVersionContent(
                    params.organizationId,
                    params.slug
                );

                if (!openAPISpecVersionContent) {
                    throw new DataFetcherError('OpenAPI spec version content not found', 404);
                }

                return openAPISpecVersionContent;
            });
        },

        getSiteRedirectBySource(params) {
            return wrapDataFetcherError(async () => {
                const siteRedirect = await getSiteRedirectBySource(params);
                if (!siteRedirect) {
                    throw new DataFetcherError('Site redirect not found', 404);
                }

                return siteRedirect;
            });
        },
        getEmbedByUrl(params) {
            return wrapDataFetcherError(() => {
                return getEmbedByUrlInSpace(params.spaceId, params.url);
            });
        },

        searchSiteContent(params) {
            return wrapDataFetcherError(async () => {
                const { organizationId, siteId, query, cacheBust, scope } = params;
                const result = await searchSiteContent(
                    organizationId,
                    siteId,
                    query,
                    scope,
                    cacheBust
                );
                return result.items;
            });
        },

        renderIntegrationUi(params) {
            return wrapDataFetcherError(async () => {
                const result = await renderIntegrationUi(params.integrationName, params.request);
                return result;
            });
        },
    };

    return dataFetcher;
}

/**
 * Fetch the context for a site pointer.
 */
export async function fetchV1ContextForSitePointer(pointer: SiteContentPointer) {
    const baseContext = await getV1BaseContext();

    const context = await fetchSiteContextByIds(baseContext, {
        organization: pointer.organizationId,
        site: pointer.siteId,
        siteSection: pointer.siteSectionId,
        siteSpace: pointer.siteSpaceId,
        space: pointer.spaceId,
        shareKey: pointer.siteShareKey,
        changeRequest: pointer.changeRequestId,
        revision: pointer.revisionId,
    });

    context.customization = await getDynamicCustomizationSettings(context.customization);

    return context;
}

/**
 * Fetch the context for a space pointer.
 */
export async function fetchV1ContextForSpacePointer(pointer: SpaceContentPointer) {
    const baseContext = await getV1BaseContext();
    return fetchSpaceContextByIds(baseContext, {
        space: pointer.spaceId,
        shareKey: undefined,
        changeRequest: pointer.changeRequestId,
        revision: pointer.revisionId,
    });
}

/**
 * Get the site pointer (ids) from a site context.
 */
export function getSitePointerFromContext(context: GitBookSiteContext): SiteContentPointer {
    return {
        organizationId: context.organizationId,
        siteId: context.site.id,
        siteSectionId: context.sections?.current?.id,
        siteSpaceId: context.siteSpace.id,
        spaceId: context.space.id,
        revisionId: context.revisionId,
        changeRequestId: context.changeRequest?.id,
        siteShareKey: context.shareKey,
    };
}
