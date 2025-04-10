import { AsyncLocalStorage } from 'node:async_hooks';
import {
    getCacheTag,
    getCacheTagForURL,
    getComputedContentSourceCacheTags,
} from '@gitbook/cache-tags';
import 'server-only';

import {
    type ComputedContentSource,
    GitBookAPI,
    GitBookAPIError,
    type HttpResponse,
    type List,
    type PublishedSiteContent,
    type PublishedSiteContentLookup,
    type RequestRenderIntegrationUI,
    type RevisionFile,
    type RevisionReusableContent,
} from '@gitbook/api';
import { headers } from 'next/headers';

import { batch } from './async';
import { buildVersion } from './build';
import {
    type CacheFunctionOptions,
    cache,
    cacheResponse,
    noCacheFetchOptions,
    parseCacheResponse,
} from './cache';

/**
 * Pointer to a relative content, it might change overtime, the pointer is relative in the content history.
 */
export interface SpaceContentPointer {
    spaceId: string;
    changeRequestId?: string;
    revisionId?: string;
}

/**
 * Pointer to a specific site content.
 */
export interface SiteContentPointer extends SpaceContentPointer {
    organizationId: string;
    siteId: string;
    /**
     * ID of the siteSection. When rendering a multi-section site. Can be undefined.
     */
    siteSectionId: string | undefined;
    /**
     * ID of the siteSpace can be undefined when rendering in multi-id mode (for site previews)
     */
    siteSpaceId: string | undefined;
    /**
     * Share key of the site that was used in lookup. Only set for `multi` and `multi-path` modes
     * where an URL with the share-link key is involved in the lookup/resolution.
     */
    siteShareKey: string | undefined;
}

/**
 * Pointer to a content that is immutable, it will never change.
 */
export interface ContentTarget {
    spaceId: string;
    revisionId: string;
}

/**
 * Parameter to cache an entry for a certain period of time.
 * It'll cache it for 1 week and revalidate it 24h before expiration.
 *
 * We don't cache for more than this to ensure we don't use too much storage and keep the cache small.
 */
const cacheTtl_7days = {
    revalidateBefore: 24 * 60 * 60,
    ttl: 7 * 24 * 60 * 60,
};
const cacheTtl_1day = {
    revalidateBefore: 60 * 60,
    ttl: 24 * 60 * 60,
};

export type GitBookAPIContext = {
    /**
     * Instance of the GitBook API client.
     */
    client: GitBookAPI;

    /**
     * Context ID representing a hash of the visitor's attributes/assertions that are
     * included in the claims property of the content API JWT token.
     *
     * It serves as a suffix for the cache key to ensure that the content cache is invalidated
     * when these attributees/assertions change.
     */
    contextId: string | undefined;
};

const apiSyncStorage = new AsyncLocalStorage<GitBookAPIContext>();

export const DEFAULT_API_ENDPOINT = process.env.GITBOOK_API_URL ?? 'https://api.gitbook.com';

/**
 * Create a new API client with a token.
 */
export async function apiWithToken(
    apiToken: string,
    contextId: string | undefined
): Promise<GitBookAPIContext> {
    const headersList = await headers();
    const apiEndpoint = headersList.get('x-gitbook-api') ?? DEFAULT_API_ENDPOINT;

    const gitbook = new GitBookAPI({
        authToken: apiToken,
        endpoint: apiEndpoint,
        userAgent: userAgent(),
    });

    return { client: gitbook, contextId };
}

/**
 * Create an API client for the current request.
 */
export async function api(): Promise<GitBookAPIContext> {
    const existing = apiSyncStorage.getStore();
    if (existing) {
        return existing;
    }

    const headersList = await headers();
    const apiToken = headersList.get('x-gitbook-token');
    const contextId = headersList.get('x-gitbook-token-context') ?? undefined;

    if (!apiToken) {
        throw new Error(
            'Missing GitBook API token, please check that the request is correctly processed by the middleware'
        );
    }

    return apiWithToken(apiToken, contextId);
}

/**
 * Use an API client for an async function.
 */
export function withAPI<T>(client: GitBookAPIContext, fn: () => Promise<T>): Promise<T> {
    return apiSyncStorage.run(client, fn);
}

type SpaceContentLookup = Pick<
    PublishedSiteContent,
    'space' | 'changeRequest' | 'revision' | 'pathname' | 'basePath' | 'siteBasePath' | 'apiToken'
> & { kind: 'space' };

export type PublishedContentWithCache =
    | ((SpaceContentLookup | PublishedSiteContentLookup) & {
          cacheMaxAge?: number;
          cacheTags?: string[];
      })
    | {
          error: {
              code: number;
              message: string;
          };
      };

/**
 * Get a user by its ID.
 */
export const getUserById = cache({
    name: 'api.getUserById',
    tag: (userId) =>
        getCacheTag({
            tag: 'user',
            user: userId,
        }),
    tagImmutable: true,
    get: async (userId: string, options: CacheFunctionOptions) => {
        try {
            const apiCtx = await api();
            const response = await apiCtx.client.users.getUserById(userId, {
                signal: options.signal,
                ...noCacheFetchOptions,
            });
            return cacheResponse(response, {
                revalidateBefore: 60 * 60,
            });
        } catch (error) {
            if (checkHasErrorCode(error, 404)) {
                return {
                    revalidateBefore: 60 * 60,
                    data: null,
                };
            }

            throw error;
        }
    },
});

/**
 * Get the latest version of an OpenAPI spec by its slug.
 */
export const getLatestOpenAPISpecVersionContent = cache({
    name: 'api.getLatestOpenApiSpecVersionContent',
    tag: (organization, openAPISpec) =>
        getCacheTag({
            tag: 'openapi',
            organization,
            openAPISpec,
        }),
    get: async (organizationId: string, slug: string, options: CacheFunctionOptions) => {
        try {
            const apiCtx = await api();
            const response = await apiCtx.client.orgs.getLatestOpenApiSpecVersionContent(
                organizationId,
                slug,
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                }
            );
            return cacheResponse(response, { revalidateBefore: 60 * 60 });
        } catch (error) {
            if (checkHasErrorCode(error, 404)) {
                return {
                    revalidateBefore: 5,
                    data: null,
                };
            }

            throw error;
        }
    },
});

/**
 * Resolve a URL to the content to render.
 */
export const getPublishedContentByUrl = cache({
    name: 'api.getPublishedContentByUrl.v4',
    tag: (url) => getCacheTagForURL(url),
    get: async (
        url: string,
        visitorAuthToken: string | undefined,
        // Prefer undefined for a better cache key.
        redirectOnError: true | undefined,
        options: CacheFunctionOptions
    ) => {
        try {
            const apiCtx = await api();
            const response = await apiCtx.client.urls.getPublishedContentByUrl(
                {
                    url,
                    visitorAuthToken,
                    redirectOnError,
                },
                {
                    signal: options.signal,
                    ...noCacheFetchOptions,
                }
            );

            const parsed = parseCacheResponse(response);

            const data: PublishedContentWithCache = {
                ...response.data,
                cacheMaxAge: parsed.ttl,
                cacheTags: parsed.tags,
            };
            return {
                ttl: parsed.ttl,
                data,
            };
        } catch (error) {
            if (error instanceof GitBookAPIError && error.code >= 400 && error.code < 500) {
                return {
                    data: {
                        error: {
                            code: error.code,
                            message: error.errorMessage || error.message,
                        },
                    } as PublishedContentWithCache,
                    // Cache errors for max 10 minutes in case the user is making changes to its content configuration
                    // and to avoid caching too many entries when being spammed by botss
                    ttl: 60 * 10,
                };
            }

            throw error;
        }
    },
});

/**
 * Get a space by its ID.
 */
export const getSpace = cache({
    name: 'api.getSpace',
    tag: (spaceId) => getCacheTag({ tag: 'space', space: spaceId }),
    get: async (spaceId: string, shareKey: string | undefined, options: CacheFunctionOptions) => {
        const apiCtx = await api();
        const response = await apiCtx.client.spaces.getSpaceById(
            spaceId,
            {
                shareKey,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            }
        );
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

function checkHasErrorCode(error: unknown, code: number) {
    return error instanceof Error && 'code' in error && error.code === code;
}

/**
 * Get a change request by its ID.
 */
export const getChangeRequest = cache({
    name: 'api.getChangeRequest',
    tag: (spaceId, changeRequestId) =>
        getCacheTag({ tag: 'change-request', space: spaceId, changeRequest: changeRequestId }),
    get: async (spaceId: string, changeRequestId: string, options: CacheFunctionOptions) => {
        const apiCtx = await api();
        try {
            const response = await apiCtx.client.spaces.getChangeRequestById(
                spaceId,
                changeRequestId,
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                }
            );

            return cacheResponse(response, {
                ttl: 60 * 60,
                revalidateBefore: 10 * 60,
            });
        } catch (error) {
            if (checkHasErrorCode(error, 404)) {
                return {
                    data: null,
                };
            }
            throw error;
        }
    },
});

interface GetRevisionOptions {
    /**
     * Whether to fetch the Git metadata of the pages.
     * Passing `false` can optimize performances and generally should be when the Git sync is disabled (we don't need to display "Edit git" on the page).
     *
     * These options don't impact the cache key and it means revisions can be shared between different fetches with different metadata options.
     */
    metadata: boolean;
}

const getAPIContextId = async () => {
    const apiCtx = await api();
    return apiCtx.contextId;
};

/**
 * Get a revision by its ID.
 */
export const getRevision = cache({
    name: 'api.getRevision.v2',
    tag: (spaceId, revisionId) =>
        getCacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    tagImmutable: true,
    getKeySuffix: getAPIContextId,
    get: async (
        spaceId: string,
        revisionId: string,
        fetchOptions: GetRevisionOptions,
        options: CacheFunctionOptions
    ) => {
        const apiCtx = await api();
        const response = await apiCtx.client.spaces.getRevisionById(
            spaceId,
            revisionId,
            {
                metadata: fetchOptions.metadata,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            }
        );

        return cacheResponse(response, fetchOptions.metadata ? cacheTtl_7days : cacheTtl_1day);
    },
    getKeyArgs: (args) => [args[0], args[1]],
});

/**
 * Get all the pages in a revision of a space.
 */
export const getRevisionPages = cache({
    name: 'api.getRevisionPages.v4',
    tag: (spaceId, revisionId) =>
        getCacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    tagImmutable: true,
    getKeySuffix: getAPIContextId,
    get: async (
        spaceId: string,
        revisionId: string,
        fetchOptions: GetRevisionOptions,
        options: CacheFunctionOptions
    ) => {
        const apiCtx = await api();
        const response = await apiCtx.client.spaces.listPagesInRevisionById(
            spaceId,
            revisionId,
            {
                metadata: fetchOptions.metadata,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            }
        );

        return cacheResponse(response, {
            ...(fetchOptions.metadata ? cacheTtl_7days : cacheTtl_1day),
            data: response.data.pages,
        });
    },
    getKeyArgs: (args) => [args[0], args[1]],
});

/**
 * Get a revision page by its path
 */
export const getRevisionPageByPath = cache({
    name: 'api.getRevisionPageByPath.v3',
    tag: (spaceId, revisionId) =>
        getCacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    tagImmutable: true,
    getKeySuffix: getAPIContextId,
    get: async (
        spaceId: string,
        revisionId: string,
        pagePath: string,
        options: CacheFunctionOptions
    ) => {
        const encodedPath = encodeURIComponent(pagePath);

        try {
            const apiCtx = await api();
            const response = await apiCtx.client.spaces.getPageInRevisionByPath(
                spaceId,
                revisionId,
                encodedPath,
                {
                    metadata: false,
                },
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                }
            );

            return cacheResponse(response, cacheTtl_7days);
        } catch (error) {
            if (checkHasErrorCode(error, 404)) {
                return {
                    data: null,
                    ...cacheTtl_7days,
                };
            }

            throw error;
        }
    },
});

/**
 * Resolve a file by its ID.
 * It should not be used directly, use `getRevisionFile` instead.
 */
const getRevisionFileById = cache({
    name: 'api.getRevisionFile.v3',
    tag: (spaceId, revisionId) =>
        getCacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    tagImmutable: true,
    get: async (
        spaceId: string,
        revisionId: string,
        fileId: string,
        options: CacheFunctionOptions
    ) => {
        try {
            const apiCtx = await api();
            const response = await apiCtx.client.spaces.getFileInRevisionById(
                spaceId,
                revisionId,
                fileId,
                {
                    metadata: false,
                },
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                }
            );

            return cacheResponse(response, cacheTtl_7days);
        } catch (error: any) {
            if (error instanceof GitBookAPIError && error.code === 404) {
                return { data: null, ...cacheTtl_7days };
            }

            throw error;
        }
    },
});

const getRevisionReusableContentById = cache({
    name: 'api.getRevisionReusableContentById.v1',
    tag: (spaceId, revisionId) =>
        getCacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    tagImmutable: true,
    getKeySuffix: getAPIContextId,
    get: async (
        spaceId: string,
        revisionId: string,
        reusableContentId: string,
        options: CacheFunctionOptions
    ) => {
        try {
            const apiCtx = await api();
            const response = await apiCtx.client.spaces.getReusableContentInRevisionById(
                spaceId,
                revisionId,
                reusableContentId,
                {
                    metadata: false,
                },
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                }
            );

            return cacheResponse(response, cacheTtl_7days);
        } catch (error: any) {
            if (error instanceof GitBookAPIError && error.code === 404) {
                return { data: null, ...cacheTtl_7days };
            }

            throw error;
        }
    },
});

/**
 * Get all the files in a revision of a space.
 * It should not be used directly, use `getRevisionFile` instead.
 */
const getRevisionAllFiles = cache({
    name: 'api.getRevisionAllFiles.v2',
    tag: (spaceId, revisionId) =>
        getCacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    tagImmutable: true,
    get: async (spaceId: string, revisionId: string, options: CacheFunctionOptions) => {
        const response = await getAll(
            async (params) => {
                const apiCtx = await api();
                const response = await apiCtx.client.spaces.listFilesInRevisionById(
                    spaceId,
                    revisionId,
                    {
                        ...params,
                        metadata: false,
                    },
                    {
                        ...noCacheFetchOptions,
                        signal: options.signal,
                    }
                );
                return response;
            },
            {
                limit: 1000,
            }
        );

        const files: { [fileId: string]: RevisionFile } = {};
        response.data.items.forEach((file) => {
            files[file.id] = file;
        });

        return cacheResponse(response, { ...cacheTtl_7days, data: files });
    },
    timeout: 60 * 1000,
});

/**
 * Resolve a file by its ID.
 * The approach is optimized to use the entire list of files in the revision if it has been fetched
 * or to use a per-file approach if not.
 */
export const getRevisionFile = batch<[string, string, string], RevisionFile | null>(
    async (executions) => {
        const [spaceId, revisionId] = executions[0];

        const hasRevisionInMemory = await getRevision.hasInMemory(spaceId, revisionId, {
            metadata: false,
        });
        const hasRevisionFilesInMemory = await getRevisionAllFiles.hasInMemory(spaceId, revisionId);

        // When fetching more than 5 files, we should bundle them all into one call to get the entire revision
        if (executions.length > 5 || hasRevisionFilesInMemory || hasRevisionInMemory) {
            let files: Record<string, RevisionFile> = {};

            if (hasRevisionInMemory) {
                const revision = await getRevision(spaceId, revisionId, { metadata: false });
                files = {};
                revision.files.forEach((file) => {
                    files[file.id] = file;
                });
            } else {
                files = await getRevisionAllFiles(spaceId, revisionId);
            }

            return executions.map(([_spaceId, _revisionId, fileId]) => files[fileId] ?? null);
        }
        // Fetch file individually
        return Promise.all(
            executions.map(([spaceId, revisionId, fileId]) =>
                getRevisionFileById(spaceId, revisionId, fileId)
            )
        );
    },
    {
        delay: 20,
        groupBy: (spaceId, revisionId) => `${spaceId}/${revisionId}`,
        skip: async (spaceId, revisionId, fileId) => {
            return (
                (await getRevision.hasInMemory(spaceId, revisionId, {
                    metadata: false,
                })) ||
                (await getRevisionAllFiles.hasInMemory(spaceId, revisionId)) ||
                (await getRevisionFileById.hasInMemory(spaceId, revisionId, fileId))
            );
        },
    }
);

/**
 * Get reusable content in a revision.
 */
export const getReusableContent = async (
    spaceId: string,
    revisionId: string,
    reusableContentId: string
): Promise<RevisionReusableContent | null> => {
    const hasRevisionInMemory = await getRevision.hasInMemory(spaceId, revisionId, {
        metadata: false,
    });

    if (hasRevisionInMemory) {
        const revision = await getRevision(spaceId, revisionId, { metadata: false });
        return (
            revision.reusableContents.find(
                (reusableContent) => reusableContent.id === reusableContentId
            ) ?? null
        );
    }
    return getRevisionReusableContentById(spaceId, revisionId, reusableContentId);
};

/**
 * Get a document by its ID.
 */
export const getDocument = cache({
    name: 'api.getDocument.v2',
    tag: (spaceId, documentId) =>
        getCacheTag({ tag: 'document', space: spaceId, document: documentId }),
    tagImmutable: true,
    getKeySuffix: getAPIContextId,
    get: async (spaceId: string, documentId: string, options: CacheFunctionOptions) => {
        const apiCtx = await api();
        const response = await apiCtx.client.spaces.getDocumentById(
            spaceId,
            documentId,
            {
                schema: 'next',
            },
            {
                signal: options.signal,
                ...noCacheFetchOptions,
            }
        );
        return cacheResponse(response, cacheTtl_7days);
    },
    // Temporarily allow for a longer timeout than the default 10s
    // because GitBook's API currently re-normalizes all documents
    // and it can take more than 10s...
    timeout: 20 * 1000,
});

/**
 * Get a computed document.
 */
export const getComputedDocument = cache({
    name: 'api.getComputedDocument',
    tag: (organizationId, spaceId, source) =>
        getComputedContentSourceCacheTags(
            {
                organizationId,
                spaceId,
            },
            source
        )[0],
    getKeySuffix: getAPIContextId,
    get: async (
        _organizationId: string,
        spaceId: string,
        source: ComputedContentSource,
        seed: string,
        options: CacheFunctionOptions
    ) => {
        const apiCtx = await api();
        const response = await apiCtx.client.spaces.getComputedDocument(
            spaceId,
            {
                source,
                seed,
            },
            {},
            {
                signal: options.signal,
                ...noCacheFetchOptions,
            }
        );
        return cacheResponse(response, cacheTtl_7days);
    },
    // Temporarily allow for a longer timeout than the default 10s
    // because GitBook's API currently re-normalizes all documents
    // and it can take more than 10s...
    timeout: 20 * 1000,
});

/**
 * Mimic the validation done on source server-side to reduce API usage.
 */
function validateSiteRedirectSource(source: string) {
    return source.length <= 512 && /^\/[a-zA-Z0-9-_.\\/]+[a-zA-Z0-9-_.]$/.test(source);
}

/**
 * Resolve a site redirect by its source path.
 */
export const getSiteRedirectBySource = cache({
    name: 'api.getSiteRedirectBySource',
    tag: ({ siteId }) => getCacheTag({ tag: 'site', site: siteId }),
    getKeySuffix: getAPIContextId,
    get: async (
        args: {
            organizationId: string;
            siteId: string;
            /** Site share key that can be used as context to resolve site space published urls */
            siteShareKey: string | undefined;
            source: string;
        },
        options: CacheFunctionOptions
    ) => {
        // Validate the source to avoid unnecessary API calls.
        if (!validateSiteRedirectSource(args.source)) {
            return {
                data: null,
                ...cacheTtl_1day,
            };
        }
        try {
            const apiCtx = await api();
            const response = await apiCtx.client.orgs.getSiteRedirectBySource(
                args.organizationId,
                args.siteId,
                {
                    shareKey: args.siteShareKey,
                    source: args.source,
                },
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                }
            );
            return cacheResponse(response, cacheTtl_1day);
        } catch (error) {
            // 422 is returned when the source is invalid
            // we don't want to throw but just return null
            if (checkHasErrorCode(error, 422)) {
                return {
                    data: null,
                    ...cacheTtl_1day,
                };
            }

            if (checkHasErrorCode(error, 404)) {
                return {
                    data: null,
                    ...cacheTtl_1day,
                };
            }

            throw error;
        }
    },
});

/**
 * Get the infos about a site by its ID.
 */
export const getSite = cache({
    name: 'api.getSite',
    tag: (_organizationId, siteId) => getCacheTag({ tag: 'site', site: siteId }),
    getKeySuffix: getAPIContextId,
    get: async (organizationId: string, siteId: string, options: CacheFunctionOptions) => {
        const apiCtx = await api();
        const response = await apiCtx.client.orgs.getSiteById(organizationId, siteId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * Get the published content site data for a site's published experience
 */
export const getPublishedContentSite = cache({
    name: 'api.getPublishedContentSite',
    tag: ({ siteId }) => getCacheTag({ tag: 'site', site: siteId }),
    getKeySuffix: getAPIContextId,
    get: async (
        args: {
            organizationId: string;
            siteId: string /** Site share key that can be used as context to resolve site space published urls */;
            siteShareKey: string | undefined;
        },
        options: CacheFunctionOptions
    ) => {
        const apiCtx = await api();
        const response = await apiCtx.client.orgs.getPublishedContentSite(
            args.organizationId,
            args.siteId,
            {
                shareKey: args.siteShareKey,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            }
        );
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * Search content in a Site or specific SiteSpaces.
 */
export const searchSiteContent = cache({
    name: 'api.searchSiteContent',
    tag: (_organizationId, siteId) => getCacheTag({ tag: 'site', site: siteId }),
    getKeySuffix: getAPIContextId,
    get: async (
        organizationId: string,
        siteId: string,
        query: string,
        scope:
            | { mode: 'all' }
            | { mode: 'current'; siteSpaceId: string }
            | { mode: 'specific'; siteSpaceIds: string[] },
        /** A cache bust param to avoid revalidating lot of cache entries by tags */
        _cacheBust?: string,
        options?: CacheFunctionOptions
    ) => {
        const apiCtx = await api();
        const response = await apiCtx.client.orgs.searchSiteContent(
            organizationId,
            siteId,
            {
                query,
                ...scope,
            },
            undefined,
            {
                ...noCacheFetchOptions,
                signal: options?.signal,
            }
        );

        return cacheResponse(response, {
            ttl: 60 * 60,
        });
    },
});

/**
 * Render an integration contentkit UI
 */
export const renderIntegrationUi = cache({
    name: 'api.renderIntegrationUi',
    tag: (integrationName) => getCacheTag({ tag: 'integration', integration: integrationName }),
    get: async (
        integrationName: string,
        request: RequestRenderIntegrationUI,
        options: CacheFunctionOptions
    ) => {
        const apiCtx = await api();
        const response = await apiCtx.client.integrations.renderIntegrationUiWithPost(
            integrationName,
            request,
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            }
        );
        return cacheResponse(response);
    },
});

/**
 * Fetch an embed in a space.
 */
export const getEmbedByUrlInSpace = cache({
    name: 'api.getEmbedByUrlInSpace',
    tag: (spaceId) => getCacheTag({ tag: 'space', space: spaceId }),
    get: async (spaceId: string, url: string, options: CacheFunctionOptions) => {
        const apiCtx = await api();
        const response = await apiCtx.client.spaces.getEmbedByUrlInSpace(
            spaceId,
            { url },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            }
        );
        return cacheResponse(response, cacheTtl_7days);
    },
});

/**
 * Return the user agent to use for API requests.
 */
export function userAgent(): string {
    if (process.env.GITBOOK_USER_AGENT) {
        return process.env.GITBOOK_USER_AGENT;
    }

    let result = `GitBook-Open/${buildVersion()}`;
    if (process.env.GITBOOK_USER_AGENT_COMMENT) {
        result += ` (${process.env.GITBOOK_USER_AGENT_COMMENT})`;
    }

    return result;
}

/**
 * Iterate over a paginated API endpoint and return all the items.
 */
async function getAll<T, E>(
    getPage: (params: { page?: string; limit?: number }) => Promise<
        HttpResponse<
            List & {
                items: T[];
            },
            E
        >
    >,
    options: {
        limit?: number;
    } = {}
): Promise<
    HttpResponse<
        List & {
            items: T[];
        },
        E
    >
> {
    const { limit = 100 } = options;

    let page: string | undefined = undefined;
    const result: T[] = [];

    const maxPages = 100;
    for (let i = 0; i < maxPages; i++) {
        const response = await getPage({ page, limit });
        result.push(...response.data.items);

        if (response.data.next) {
            page = response.data.next.page;
        } else {
            response.data.items = result;
            return response;
        }
    }

    throw new Error('Pagination limit reached');
}
