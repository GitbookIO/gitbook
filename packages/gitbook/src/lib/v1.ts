import {
    type GitBookBaseContext,
    type GitBookSiteContext,
    fetchSiteContextByIds,
    fetchSpaceContextByIds,
} from '@v2/lib/context';
import type { GitBookDataFetcher } from '@v2/lib/data/types';
import { createImageResizer } from '@v2/lib/images';
import { createLinker } from '@v2/lib/links';

import { GitBookAPI } from '@gitbook/api';
import { DataFetcherError, wrapDataFetcherError } from '@v2/lib/data';
import { headers } from 'next/headers';
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
    getRevision,
    getRevisionPageByPath,
    getRevisionPageDocument,
    getSiteRedirectBySource,
    getSpace,
    getUserById,
    renderIntegrationUi,
    searchSiteContent,
    withAPI as withAPIV1,
} from './api';
import { getDynamicCustomizationSettings } from './customization';
import { withLeadingSlash, withTrailingSlash } from './paths';
import { assertIsNotV2 } from './v2';

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

    const dataFetcher = getDataFetcherV1();

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
function getDataFetcherV1(apiTokenOverride?: string): GitBookDataFetcher {
    let apiClient: GitBookAPI | undefined;

    /**
     * Run a function with the correct API client. If an API token is provided, we
     * create a new API client with the token. Otherwise, we use the default API client.
     */
    async function withAPI<T>(fn: () => Promise<T>): Promise<T> {
        // No token override - we can use the default API client.
        if (!apiTokenOverride) {
            return fn();
        }

        const client = await api();

        if (!apiClient) {
            // New client uses same endpoint and user agent as the default client.
            apiClient = new GitBookAPI({
                endpoint: client.client.endpoint,
                authToken: apiTokenOverride,
                userAgent: client.client.userAgent,
            });
        }

        return withAPIV1(
            {
                client: apiClient,
                contextId: client.contextId,
            },
            fn
        );
    }

    const dataFetcher: GitBookDataFetcher = {
        async api() {
            return withAPI(async () => {
                const result = await api();
                return result.client;
            });
        },

        withToken({ apiToken }) {
            return getDataFetcherV1(apiToken);
        },

        getUserById(userId) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const user = await getUserById(userId);
                    if (!user) {
                        throw new DataFetcherError('User not found', 404);
                    }

                    return user;
                })
            );
        },

        getPublishedContentSite(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    return getPublishedContentSite(params);
                })
            );
        },

        getSpace(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    return getSpace(params.spaceId, params.shareKey);
                })
            );
        },

        getChangeRequest(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const changeRequest = await getChangeRequest(
                        params.spaceId,
                        params.changeRequestId
                    );
                    if (!changeRequest) {
                        throw new DataFetcherError('Change request not found', 404);
                    }

                    return changeRequest;
                })
            );
        },

        getRevision(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    return getRevision(params.spaceId, params.revisionId, {
                        metadata: true,
                    });
                })
            );
        },

        getRevisionPageMarkdown() {
            throw new Error('Not implemented in v1');
        },

        getDocument(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const document = await getDocument(params.spaceId, params.documentId);
                    if (!document) {
                        throw new DataFetcherError('Document not found', 404);
                    }

                    return document;
                })
            );
        },

        getComputedDocument(params) {
            return withAPI(() =>
                wrapDataFetcherError(() => {
                    return getComputedDocument(
                        params.organizationId,
                        params.spaceId,
                        params.source,
                        params.seed
                    );
                })
            );
        },

        getRevisionPageDocument(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    return getRevisionPageDocument(
                        params.spaceId,
                        params.revisionId,
                        params.pageId
                    );
                })
            );
        },

        getRevisionPageByPath(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const revisionPage = await getRevisionPageByPath(
                        params.spaceId,
                        params.revisionId,
                        params.path
                    );

                    if (!revisionPage) {
                        throw new DataFetcherError('Revision page not found', 404);
                    }

                    return revisionPage;
                })
            );
        },

        getLatestOpenAPISpecVersionContent(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const openAPISpecVersionContent = await getLatestOpenAPISpecVersionContent(
                        params.organizationId,
                        params.slug
                    );

                    if (!openAPISpecVersionContent) {
                        throw new DataFetcherError('OpenAPI spec version content not found', 404);
                    }

                    return openAPISpecVersionContent;
                })
            );
        },

        getSiteRedirectBySource(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const siteRedirect = await getSiteRedirectBySource(params);
                    if (!siteRedirect) {
                        throw new DataFetcherError('Site redirect not found', 404);
                    }

                    return siteRedirect;
                })
            );
        },
        getEmbedByUrl(params) {
            return withAPI(() =>
                wrapDataFetcherError(() => {
                    return getEmbedByUrlInSpace(params.spaceId, params.url);
                })
            );
        },

        searchSiteContent(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const { organizationId, siteId, query, cacheBust, scope } = params;
                    const result = await searchSiteContent(
                        organizationId,
                        siteId,
                        query,
                        scope,
                        cacheBust
                    );
                    return result.items;
                })
            );
        },

        renderIntegrationUi(params) {
            return withAPI(() =>
                wrapDataFetcherError(async () => {
                    const result = await renderIntegrationUi(
                        params.integrationName,
                        params.request
                    );
                    return result;
                })
            );
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
        revisionId: context.revision.id,
        changeRequestId: context.changeRequest?.id,
        siteShareKey: context.shareKey,
    };
}

/**
 * Return the base path for the current request.
 * The value will start and finish with /
 */
async function getBasePath(): Promise<string> {
    assertIsNotV2();
    const headersList = await headers();
    const path = headersList.get('x-gitbook-basepath') ?? '/';

    return withTrailingSlash(withLeadingSlash(path));
}

/**
 * Return the site base path for the current request.
 * The value will start and finish with /
 */
async function getSiteBasePath(): Promise<string> {
    assertIsNotV2();
    const headersList = await headers();
    const path = headersList.get('x-gitbook-site-basepath') ?? '/';

    return withTrailingSlash(withLeadingSlash(path));
}

/**
 * Return the current host for the current request.
 */
async function getHost(): Promise<string> {
    assertIsNotV2();
    const headersList = await headers();
    const mode = headersList.get('x-gitbook-mode');
    if (mode === 'proxy') {
        return headersList.get('x-forwarded-host') ?? '';
    }

    return headersList.get('x-gitbook-host') ?? headersList.get('host') ?? '';
}
