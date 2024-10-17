import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';

import {
    ContentVisibility,
    CustomizationSettings,
    GitBookAPI,
    GitBookAPIError,
    HttpResponse,
    List,
    PublishedSiteContentLookup,
    RequestRenderIntegrationUI,
    RevisionFile,
    SiteCustomizationSettings,
    RevisionReusableContent,
} from '@gitbook/api';
import assertNever from 'assert-never';
import { headers } from 'next/headers';
import rison from 'rison';
import { DeepPartial } from 'ts-essentials';

import { batch } from './async';
import { buildVersion } from './build';
import {
    CacheFunctionOptions,
    cache,
    cacheResponse,
    noCacheFetchOptions,
    parseCacheResponse,
} from './cache';
import { defaultCustomizationForSpace } from './utils';

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

const apiSyncStorage = new AsyncLocalStorage<GitBookAPI>();

export const DEFAULT_API_ENDPOINT = process.env.GITBOOK_API_URL ?? 'https://api.gitbook.com';

/**
 * Create a new API client with a token.
 */
export function apiWithToken(apiToken: string): GitBookAPI {
    const headersList = headers();
    const apiEndpoint = headersList.get('x-gitbook-api') ?? DEFAULT_API_ENDPOINT;

    const gitbook = new GitBookAPI({
        authToken: apiToken,
        endpoint: apiEndpoint,
        userAgent: userAgent(),
    });

    return gitbook;
}

/**
 * Create an API client for the current request.
 */
export function api(): GitBookAPI {
    const existing = apiSyncStorage.getStore();
    if (existing) {
        return existing;
    }

    const headersList = headers();
    const apiToken = headersList.get('x-gitbook-token');

    if (!apiToken) {
        throw new Error(
            'Missing GitBook API token, please check that the request is correctly processed by the middleware',
        );
    }

    return apiWithToken(apiToken);
}

/**
 * Use an API client for an async function.
 */
export function withAPI<T>(client: GitBookAPI, fn: () => Promise<T>): Promise<T> {
    return apiSyncStorage.run(client, fn);
}

// FIXME: Fix @gitbook/api types for PublishedSiteContentLookup
type SpaceContentLookup = {
    kind: 'space';
    /** ID of the space matching. */
    space: string;
    /** Identifier of the change request being previewed in this URL. */
    changeRequest?: string;
    /** Identifier of the revision being previewed in this URL. */
    revision?: string;
    /** Path of the content relative to the space */
    pathname: string;
    /** Prefix of the path in the URL dedicated to the space */
    basePath: string;
    /** Short-lived API token to fetch content related to the space in the context of the URL. */
    apiToken: string;
};

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
        getAPICacheTag({
            tag: 'user',
            user: userId,
        }),
    get: async (userId: string, options: CacheFunctionOptions) => {
        try {
            const response = await api().users.getUserById(userId, {
                signal: options.signal,
                ...noCacheFetchOptions,
            });
            return cacheResponse(response, {
                revalidateBefore: 60 * 60,
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
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
 * Get a synced block by its ref.
 */
export const getSyncedBlockContent = cache({
    name: 'api.getSyncedBlockContent',
    tag: (apiToken, organizationId, syncedBlockId) =>
        getAPICacheTag({
            tag: 'synced-block',
            syncedBlock: syncedBlockId,
        }),
    get: async (
        apiToken: string,
        organizationId: string,
        syncedBlockId: string,
        options: CacheFunctionOptions,
    ) => {
        try {
            const response = await apiWithToken(apiToken).orgs.getSyncedBlockContent(
                organizationId,
                syncedBlockId,
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                },
            );
            return cacheResponse(response, {
                revalidateBefore: 60 * 60,
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
                    revalidateBefore: 60 * 60,
                    data: null,
                };
            }

            throw error;
        }
    },
    // We don't cache apiToken as it's not a stable key
    getKeyArgs: (args) => [args[1], args[2]],
});
/**
 * Resolve a URL to the content to render.
 */
export const getPublishedContentByUrl = cache({
    name: 'api.getPublishedContentByUrl.v4',
    tag: (url) =>
        getAPICacheTag({
            tag: 'url',
            hostname: new URL(url).hostname,
        }),
    get: async (
        url: string,
        visitorAuthToken: string | undefined,
        options: CacheFunctionOptions,
    ) => {
        try {
            const response = await api().urls.getPublishedContentByUrl(
                {
                    url,
                    visitorAuthToken,
                },
                {
                    signal: options.signal,
                    ...noCacheFetchOptions,
                },
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
    tag: (spaceId) => getAPICacheTag({ tag: 'space', space: spaceId }),
    get: async (spaceId: string, shareKey: string | undefined, options: CacheFunctionOptions) => {
        const response = await api().spaces.getSpaceById(
            spaceId,
            {
                shareKey,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * Get a change request by its ID.
 */
export const getChangeRequest = cache({
    name: 'api.getChangeRequest',
    tag: (spaceId, changeRequestId) =>
        getAPICacheTag({ tag: 'change-request', space: spaceId, changeRequest: changeRequestId }),
    get: async (spaceId: string, changeRequestId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getChangeRequestById(spaceId, changeRequestId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            ttl: 60 * 60,
            revalidateBefore: 10 * 60,
        });
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

/**
 * Get a revision by its ID.
 */
export const getRevision = cache({
    name: 'api.getRevision.v2',
    tag: (spaceId, revisionId) =>
        getAPICacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    get: async (
        spaceId: string,
        revisionId: string,
        fetchOptions: GetRevisionOptions,
        options: CacheFunctionOptions,
    ) => {
        const response = await api().spaces.getRevisionById(
            spaceId,
            revisionId,
            {
                metadata: fetchOptions.metadata,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
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
        getAPICacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    get: async (
        spaceId: string,
        revisionId: string,
        fetchOptions: GetRevisionOptions,
        options: CacheFunctionOptions,
    ) => {
        const response = await api().spaces.listPagesInRevisionById(
            spaceId,
            revisionId,
            {
                metadata: fetchOptions.metadata,
            },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
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
        getAPICacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    get: async (
        spaceId: string,
        revisionId: string,
        pagePath: string,
        options: CacheFunctionOptions,
    ) => {
        const encodedPath = encodeURIComponent(pagePath);

        try {
            const response = await api().spaces.getPageInRevisionByPath(
                spaceId,
                revisionId,
                encodedPath,
                {
                    metadata: false,
                },
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                },
            );

            return cacheResponse(response, cacheTtl_7days);
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
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
        getAPICacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    get: async (
        spaceId: string,
        revisionId: string,
        fileId: string,
        options: CacheFunctionOptions,
    ) => {
        try {
            const response = await (async () => {
                return api().spaces.getFileInRevisionById(
                    spaceId,
                    revisionId,
                    fileId,
                    {
                        metadata: false,
                    },
                    {
                        ...noCacheFetchOptions,
                        signal: options.signal,
                    },
                );
            })();

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
        getAPICacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    get: async (
        spaceId: string,
        revisionId: string,
        reusableContentId: string,
        options: CacheFunctionOptions,
    ) => {
        try {
            const response = await (async () => {
                return api().spaces.getReusableContentInRevisionById(
                    spaceId,
                    revisionId,
                    reusableContentId,
                    {
                        metadata: false,
                    },
                    {
                        ...noCacheFetchOptions,
                        signal: options.signal,
                    },
                );
            })();

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
        getAPICacheTag({ tag: 'revision', space: spaceId, revision: revisionId }),
    get: async (spaceId: string, revisionId: string, options: CacheFunctionOptions) => {
        const response = await getAll(
            (params) =>
                api().spaces.listFilesInRevisionById(
                    spaceId,
                    revisionId,
                    {
                        ...params,
                        metadata: false,
                    },
                    {
                        ...noCacheFetchOptions,
                        signal: options.signal,
                    },
                ),
            {
                limit: 1000,
            },
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

            return executions.map(([spaceId, revisionId, fileId]) => files[fileId] ?? null);
        } else {
            // Fetch file individually
            return Promise.all(
                executions.map(([spaceId, revisionId, fileId]) =>
                    getRevisionFileById(spaceId, revisionId, fileId),
                ),
            );
        }
    },
    {
        delay: 20,
        groupBy: (spaceId, revisionId) => spaceId + '/' + revisionId,
        skip: async (spaceId, revisionId, fileId) => {
            return (
                (await getRevision.hasInMemory(spaceId, revisionId, {
                    metadata: false,
                })) ||
                (await getRevisionAllFiles.hasInMemory(spaceId, revisionId)) ||
                (await getRevisionFileById.hasInMemory(spaceId, revisionId, fileId))
            );
        },
    },
);

/**
 * Get reusable content in a revision.
 */
export const getReusableContent = async (
    spaceId: string,
    revisionId: string,
    reusableContentId: string,
): Promise<RevisionReusableContent | null> => {
    const hasRevisionInMemory = await getRevision.hasInMemory(spaceId, revisionId, {
        metadata: false,
    });

    if (hasRevisionInMemory) {
        const revision = await getRevision(spaceId, revisionId, { metadata: false });
        return (
            revision.reusableContents.find(
                (reusableContent) => reusableContent.id === reusableContentId,
            ) ?? null
        );
    } else {
        return getRevisionReusableContentById(spaceId, revisionId, reusableContentId);
    }
};

/**
 * Get a document by its ID.
 */
export const getDocument = cache({
    name: 'api.getDocument.v2',
    tag: (spaceId, documentId) =>
        getAPICacheTag({ tag: 'document', space: spaceId, document: documentId }),
    get: async (spaceId: string, documentId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getDocumentById(
            spaceId,
            documentId,
            {
                schema: 'next',
            },
            {
                signal: options.signal,
                ...noCacheFetchOptions,
            },
        );
        return cacheResponse(response, cacheTtl_7days);
    },
    // Temporarily allow for a longer timeout than the default 10s
    // because GitBook's API currently re-normalizes all documents
    // and it can take more than 10s...
    timeout: 20 * 1000,
});

/**
 * Get the customization settings for a site-space from the API.
 */
const getSiteSpaceCustomizationFromAPI = cache({
    name: 'api.getSiteSpaceCustomizationById',
    tag: (organizationId, siteId, siteSpaceId) => getAPICacheTag({ tag: 'site', site: siteId }),
    get: async (
        organizationId: string,
        siteId: string,
        siteSpaceId: string,
        options: CacheFunctionOptions,
    ) => {
        const response = await api().orgs.getSiteSpaceCustomizationById(
            organizationId,
            siteId,
            siteSpaceId,
            {},
            {
                signal: options.signal,
                ...noCacheFetchOptions,
            },
        );
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * Get the customization settings for a site from the API.
 */
const getSiteCustomizationFromAPI = cache({
    name: 'api.getSiteCustomizationById',
    tag: (organizationId, siteId) => getAPICacheTag({ tag: 'site', site: siteId }),
    get: async (organizationId: string, siteId: string, options: CacheFunctionOptions) => {
        const response = await api().orgs.getSiteCustomizationById(
            organizationId,
            siteId,
            {},
            {
                signal: options.signal,
                ...noCacheFetchOptions,
            },
        );
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * Get the customization settings for a site space from the API.
 */
async function getSiteSpaceCustomization(args: {
    organizationId: string;
    siteId: string;
    siteSpaceId: string;
}): Promise<SiteCustomizationSettings> {
    const raw = await getSiteSpaceCustomizationFromAPI(
        args.organizationId,
        args.siteId,
        args.siteSpaceId,
    );

    return mergeCustomizationWithExtend(raw);
}

/**
 * Get the customization settings for a site space from the API.
 */
async function getSiteCustomization(args: {
    organizationId: string;
    siteId: string;
}): Promise<SiteCustomizationSettings> {
    const raw = await getSiteCustomizationFromAPI(args.organizationId, args.siteId);
    return mergeCustomizationWithExtend(raw);
}

/**
 * Get the infos about a site by its ID.
 */
export const getSite = cache({
    name: 'api.getSite',
    tag: (organizationId, siteId) => getAPICacheTag({ tag: 'site', site: siteId }),
    get: async (organizationId: string, siteId: string, options: CacheFunctionOptions) => {
        const response = await api().orgs.getSiteById(organizationId, siteId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * List all the site-spaces variants published in a site.
 */
export const getSiteSpaces = cache({
    name: 'api.getSiteSpaces',
    tag: ({ siteId }) => getAPICacheTag({ tag: 'site', site: siteId }),
    get: async (
        args: {
            organizationId: string;
            siteId: string;
            /** Site share key that can be used as context to resolve site space published urls */
            siteShareKey: string | undefined;
        },
        options: CacheFunctionOptions,
    ) => {
        const response = await getAll((params) =>
            api().orgs.listSiteSpaces(
                args.organizationId,
                args.siteId,
                {
                    ...params,
                    ...(args.siteShareKey ? { shareKey: args.siteShareKey } : {}),
                },
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                },
            ),
        );

        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
            data: response.data.items.map((siteSpace) => siteSpace),
        });
    },
});

/**
 * List the scripts to load for the site.
 */
export const getSiteIntegrationScripts = cache({
    name: 'api.getSiteIntegrationScripts',
    tag: (organizationId, siteId) => getAPICacheTag({ tag: 'site', site: siteId }),
    get: async (organizationId: string, siteId: string, options: CacheFunctionOptions) => {
        const response = await api().orgs.listSiteIntegrationScripts(organizationId, siteId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * Fetch all the data to render the current site at once.
 */
export async function getSiteData(pointer: SiteContentPointer) {
    const [{ space, pages, contentTarget }, { customization, scripts }] = await Promise.all([
        getSpaceContentData(pointer, pointer.siteShareKey),
        getSiteLayoutData(pointer),
    ]);

    return {
        space,
        pages,
        contentTarget,
        customization,
        scripts,
    };
}

/**
 * Fetch all the layout data about the current site at once.
 */
export async function getSiteLayoutData(args: {
    organizationId: string;
    siteId: string;
    siteSpaceId: string | undefined;
}) {
    const [customization, scripts] = await Promise.all([
        getCurrentSiteCustomization(args),
        getSiteIntegrationScripts(args.organizationId, args.siteId),
    ]);

    return {
        customization,
        scripts,
    };
}

/**
 * Get the customization settings for the current site from the API.
 */
export async function getCurrentSiteCustomization(args: {
    organizationId: string;
    siteId: string;
    siteSpaceId: string | undefined;
}): Promise<SiteCustomizationSettings> {
    return args.siteSpaceId
        ? getSiteSpaceCustomization({
              organizationId: args.organizationId,
              siteId: args.siteId,
              siteSpaceId: args.siteSpaceId,
          })
        : getSiteCustomization({
              organizationId: args.organizationId,
              siteId: args.siteId,
          });
}

/**
 * Get the customization settings for a space from the API.
 */
export async function getSpaceCustomization(spaceId: string): Promise<CustomizationSettings> {
    const headersList = headers();
    const raw = defaultCustomizationForSpace();

    const extend = headersList.get('x-gitbook-customization');
    if (extend) {
        try {
            const parsed = rison.decode_object<Partial<CustomizationSettings>>(extend);
            return { ...raw, ...parsed };
        } catch (error) {
            console.error(
                `Failed to parse x-gitbook-customization header (ignored): ${
                    (error as Error).stack ?? (error as Error).message ?? error
                }`,
            );
        }
    }

    return raw;
}

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = cache({
    name: 'api.getCollection',
    tag: (collectionId) => getAPICacheTag({ tag: 'collection', collection: collectionId }),
    get: async (collectionId: string, options: CacheFunctionOptions) => {
        const response = await api().collections.getCollectionById(collectionId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
        });
    },
});

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = cache({
    name: 'api.getCollectionSpaces',
    tag: (collectionId) => getAPICacheTag({ tag: 'collection', collection: collectionId }),
    get: async (collectionId: string, options: CacheFunctionOptions) => {
        const response = await getAll((params) =>
            api().collections.listSpacesInCollectionById(collectionId, params, {
                ...noCacheFetchOptions,
                signal: options.signal,
            }),
        );

        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
            data: response.data.items.filter(
                (space) => space.visibility === ContentVisibility.InCollection,
            ),
        });
    },
});

/**
 * Fetch all the content data about a space at once.
 * This function executes the requests in parallel and should be used as early as possible
 * instead of calling the individual functions.
 */
export async function getSpaceContentData(
    pointer: SpaceContentPointer,
    shareKey: string | undefined,
) {
    const [space, changeRequest] = await Promise.all([
        getSpace(pointer.spaceId, shareKey),
        pointer.changeRequestId ? getChangeRequest(pointer.spaceId, pointer.changeRequestId) : null,
    ]);

    const contentTarget: ContentTarget = {
        spaceId: pointer.spaceId,
        revisionId: changeRequest?.revision ?? pointer.revisionId ?? space.revision,
    };
    const [pages] = await Promise.all([
        getRevisionPages(space.id, contentTarget.revisionId, {
            // We only care about the Git metadata when the Git sync is enabled
            // otherwise we can optimize performance by not fetching it
            metadata: !!space.gitSync,
        }),
    ]);

    return {
        space,
        pages,
        contentTarget,
    };
}

/**
 * Search content in a space.
 */
export const searchSpaceContent = cache({
    name: 'api.searchSpaceContent',
    tag: (spaceId) => getAPICacheTag({ tag: 'space', space: spaceId }),
    get: async (
        spaceId: string,
        /** The revision ID is used as a cache bust key, to avoid revalidating lot of cache entries by tags */
        revisionId: string,
        query: string,
        options: CacheFunctionOptions,
    ) => {
        const response = await api().spaces.searchSpaceContent(
            spaceId,
            { query },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response);
    },
});

/**
 * Search content accross all spaces in a parent (site or collection).
 */
export const searchParentContent = cache({
    name: 'api.searchParentContent',
    tag: (spaceId) => getAPICacheTag({ tag: 'space', space: spaceId }),
    get: async (parentId: string, query: string, options: CacheFunctionOptions) => {
        const response = await api().search.searchContent(
            { query },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response, {
            ttl: 60 * 60,
        });
    },
});

/**
 * Search content in a Site or specific SiteSpaces.
 */
export const searchSiteContent = cache({
    name: 'api.searchSiteContent',
    tag: (organizationId, siteId) => getAPICacheTag({ tag: 'site', site: siteId }),
    get: async (
        organizationId: string,
        siteId: string,
        query: string,
        siteSpaceIds?: string[],
        /** A cache bust param to avoid revalidating lot of cache entries by tags */
        cacheBust?: string,
        options?: CacheFunctionOptions,
    ) => {
        const response = await api().orgs.searchSiteContent(
            organizationId,
            siteId,
            {
                query,
                siteSpaceIds,
            },
            undefined,
            {
                ...noCacheFetchOptions,
                signal: options?.signal,
            },
        );

        return cacheResponse(response, {
            ttl: 60 * 60,
        });
    },
});

/**
 * Get a list of recommended questions in a space.
 */
export const getRecommendedQuestionsInSpace = cache({
    name: 'api.getRecommendedQuestionsInSpace',
    tag: (spaceId) => getAPICacheTag({ tag: 'space', space: spaceId }),
    get: async (spaceId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getRecommendedQuestionsInSpace(spaceId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response);
    },
});

/**
 * Render an integration contentkit UI
 */
export const renderIntegrationUi = cache({
    name: 'api.renderIntegrationUi',
    tag: (integrationName) => getAPICacheTag({ tag: 'integration', integration: integrationName }),
    get: async (
        integrationName: string,
        request: RequestRenderIntegrationUI,
        options: CacheFunctionOptions,
    ) => {
        const response = await api().integrations.renderIntegrationUiWithPost(
            integrationName,
            request,
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response);
    },
});

/**
 * Fetch an embed.
 * We don't cache them by cache tag, as we never purge them (they expire after 7 days).
 */
export const getEmbedByUrl = cache({
    name: 'api.getEmbedByUrl',
    get: async (url: string, options: CacheFunctionOptions) => {
        const response = await api().urls.getEmbedByUrl(
            { url },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response);
    },
});

/**
 * Fetch an embed in a space.
 */
export const getEmbedByUrlInSpace = cache({
    name: 'api.getEmbedByUrlInSpace',
    tag: (spaceId) => getAPICacheTag({ tag: 'space', space: spaceId }),
    get: async (spaceId: string, url: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getEmbedByUrlInSpace(
            spaceId,
            { url },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response, cacheTtl_7days);
    },
});

/**
 * Create a cache tag for the API.
 */
export function getAPICacheTag(
    spec: // All data related to a user
    | {
              tag: 'user';
              user: string;
          }
        // All data related to a space
        | {
              tag: 'space';
              space: string;
          }
        // All data related to an integration
        | {
              tag: 'integration';
              integration: string;
          }
        // All data related to a change request
        | {
              tag: 'change-request';
              space: string;
              changeRequest: string;
          }
        // Immutable data related to a revision
        | {
              tag: 'revision';
              space: string;
              revision: string;
          }
        // Immutable data related to a document
        | {
              tag: 'document';
              space: string;
              document: string;
          }
        // All data related to the URL of a content
        | {
              tag: 'url';
              hostname: string;
          }
        // All data related to a collection
        | {
              tag: 'collection';
              collection: string;
          }
        // All data related to a synced block
        | {
              tag: 'synced-block';
              syncedBlock: string;
          }
        // All data related to a site
        | {
              tag: 'site';
              site: string;
          },
): string {
    switch (spec.tag) {
        case 'user':
            return `user:${spec.user}`;
        case 'url':
            return `url:${spec.hostname}`;
        case 'space':
            return `space:${spec.space}`;
        case 'change-request':
            return `space:${spec.space}:change-request:${spec.changeRequest}`;
        case 'revision':
            return `space:${spec.space}:revision:${spec.revision}`;
        case 'document':
            return `space:${spec.space}:document:${spec.document}`;
        case 'collection':
            return `collection:${spec.collection}`;
        case 'synced-block':
            return `synced-block:${spec.syncedBlock}`;
        case 'site':
            return `site:${spec.site}`;
        case 'integration':
            return `integration:${spec.integration}`;
        default:
            assertNever(spec);
    }
}

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
 * Ignore error for an API call.
 */
export async function ignoreAPIError<T>(
    promise: Promise<T>,
    ignoreAll: boolean = false,
): Promise<T | null> {
    try {
        return await promise;
    } catch (error) {
        const code = (error as GitBookAPIError).code;
        if (ignoreAll || (code >= 400 && code < 500)) {
            return null;
        }

        throw error;
    }
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
    } = {},
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

    while (1) {
        const response = await getPage({ page, limit });
        result.push(...response.data.items);

        if (response.data.next) {
            page = response.data.next.page;
        } else {
            response.data.items = result;
            return response;
        }
    }

    throw new Error('Unreachable');
}

/**
 * Merge the customization settings with the ones passed in the x-gitbook-customization header if present.
 */
function mergeCustomizationWithExtend<T extends SiteCustomizationSettings | CustomizationSettings>(
    raw: T,
) {
    const headersList = headers();
    const extend = headersList.get('x-gitbook-customization');
    if (extend) {
        try {
            const parsed = rison.decode_object<DeepPartial<T>>(extend);

            // Merge objects and some properties deep
            return mergeDeepPlainObject(raw, parsed, ['styling', 'themes']);
        } catch (error) {
            console.error(
                `Failed to parse x-gitbook-customization header (ignored): ${
                    (error as Error).stack ?? (error as Error).message ?? error
                }`,
            );
        }
    }

    return raw;
}

function mergeDeepPlainObject<T>(target: T, source: DeepPartial<T>, keys: Array<keyof T>): T {
    if (typeof target !== 'object' || target === null) {
        return target;
    }

    const result = { ...target };

    for (const key in source) {
        const value = source[key];
        if (value === undefined) {
            continue;
        }

        if (
            typeof value === 'object' &&
            !Array.isArray(value) &&
            value !== null &&
            keys.includes(key as keyof T)
        ) {
            // @ts-ignore
            result[key] = mergeDeepPlainObject(target[key] ?? {}, value, []);
        } else {
            // @ts-ignore
            result[key] = value;
        }
    }

    return result;
}
