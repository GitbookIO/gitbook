import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';

import {
    ContentVisibility,
    CustomizationSettings,
    GitBookAPI,
    GitBookAPIError,
    HttpResponse,
    List,
    PublishedContentLookup,
    RequestRenderIntegrationUI,
} from '@gitbook/api';
import assertNever from 'assert-never';
import { headers } from 'next/headers';
import rison from 'rison';

import { buildVersion } from './build';
import {
    CacheFunctionOptions,
    cache,
    cacheResponse,
    noCacheFetchOptions,
    parseCacheResponse,
} from './cache';

/**
 * Pointer to a relative content, it might change overtime, the pointer is relative in the content history.
 */
export interface ContentPointer {
    spaceId: string;
    changeRequestId?: string;
    revisionId?: string;
}

/**
 * Pointer to a content that is immutable, it will never change.
 */
export interface ContentTarget {
    spaceId: string;
    revisionId: string;
}

/**
 * Parameter to cache an entry as an immutable one (ex: revisions, documents).
 * It'll cache it for 1 week and revalidate it 24h before expiration.
 * 
 * We don't cache for more than this to ensure we don't use too much storage and keep the cache small.
 */
const immutableCacheTtl = {
    revalidateBefore: 24 * 60 * 60,
    ttl: 7 * 24 * 60 * 60,
    tags: [],
};

const apiSyncStorage = new AsyncLocalStorage<GitBookAPI>();

/**
 * Create a new API client with a token.
 */
export function apiWithToken(apiToken: string): GitBookAPI {
    const headersList = headers();
    const apiEndpoint = headersList.get('x-gitbook-api') ?? undefined;

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

export type PublishedContentWithCache =
    | (PublishedContentLookup & {
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
export const getUserById = cache(
    'api.getUserById',
    async (userId: string, options: CacheFunctionOptions) => {
        try {
            const response = await api().users.getUserById(userId, {
                signal: options.signal,
                ...noCacheFetchOptions,
            });
            return cacheResponse(response, {
                revalidateBefore: 60 * 60,
                tags: [],
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
                    revalidateBefore: 60 * 60,
                    data: null,
                    tags: [],
                };
            }

            throw error;
        }
    },
);

/**
 * Get a synced block by its ref.
 */
export const getSyncedBlock = cache(
    'api.getSyncedBlock',
    async (
        apiToken: string,
        organizationId: string,
        syncedBlockId: string,
        options: CacheFunctionOptions,
    ) => {
        try {
            const response = await apiWithToken(apiToken).orgs.getSyncedBlock(
                organizationId,
                syncedBlockId,
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                },
            );
            return cacheResponse(response, {
                revalidateBefore: 60 * 60,
                tags: [],
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
                    revalidateBefore: 60 * 60,
                    data: null,
                    tags: [],
                };
            }

            throw error;
        }
    },
    {
        // We don't cache apiToken as it's not a stable key
        extractArgs: (args) => [args[1], args[2]],
    },
);
/**
 * Resolve a URL to the content to render.
 */
export const getPublishedContentByUrl = cache(
    'api.getPublishedContentByUrl',
    async (url: string, visitorAuthToken: string | undefined, options: CacheFunctionOptions) => {
        try {
            const response = await api().urls.getPublishedContentByUrl(
                {
                    url,
                    visitorAuthToken,
                },
                {
                    secure: false,
                    signal: options.signal,
                    ...noCacheFetchOptions,
                },
            );

            const parsed = parseCacheResponse(response);

            const tags = [
                ...parsed.tags,
                ...('space' in response.data
                    ? [getAPICacheTag({ tag: 'space', space: response.data.space })]
                    : []),
            ];

            const data: PublishedContentWithCache = {
                ...response.data,
                cacheMaxAge: parsed.ttl,
                cacheTags: tags,
            };
            return {
                tags,
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
                    ttl: 60 * 10,
                    tags: [],
                };
            }

            throw error;
        }
    },
);

/**
 * Get a space by its ID.
 */
export const getSpace = cache(
    'api.getSpace',
    async (spaceId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getSpaceById(spaceId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
        });
    },
);

/**
 * Get a change request by its ID.
 */
export const getChangeRequest = cache(
    'api.getChangeRequest',
    async (spaceId: string, changeRequestId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getChangeRequestById(spaceId, changeRequestId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            // We don't cache for long as we currently don't invalidate change-request cache
            // and it's only used  for preview where perfs are not critical
            ttl: 60 * 60,
            revalidateBefore: 10 * 60,
            tags: [],
        });
    },
);

/**
 * List the scripts to load for the space.
 */
export const getSpaceIntegrationScripts = cache(
    'api.getSpaceIntegrationScripts',
    async (spaceId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.listSpaceIntegrationScripts(spaceId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
        });
    },
);

/**
 * Get a revision by its ID.
 */
export const getRevision = cache(
    'api.getRevision',
    async (spaceId: string, revisionId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getRevisionById(spaceId, revisionId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });

        return cacheResponse(response, immutableCacheTtl);
    },
);

/**
 * Get all the pages in a revision of a space.
 */
export const getRevisionPages = cache(
    'api.getRevisionPages.v2',
    async (spaceId: string, revisionId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.listPagesInRevisionById(spaceId, revisionId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });

        return cacheResponse(response, {
            ...immutableCacheTtl,
            data: response.data.pages,
        });
    },
);

/**
 * Get a revision page by its path
 */
export const getRevisionPageByPath = cache(
    'api.getRevisionPageByPath.v2',
    async (
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
                {},
                {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                },
            );

            return cacheResponse(response, immutableCacheTtl);
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
                    data: null,
                    ...immutableCacheTtl,
                };
            }

            throw error;
        }
    },
);

/**
 * Resolve a file by its ID.
 */
export const getRevisionFile = cache(
    'api.getRevisionFile.v2',
    async (spaceId: string, revisionId: string, fileId: string, options: CacheFunctionOptions) => {
        try {
            const response = await (async () => {
                return api().spaces.getFileInRevisionById(spaceId, revisionId, fileId, {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                });
            })();

            return cacheResponse(response, immutableCacheTtl);
        } catch (error: any) {
            if (error instanceof GitBookAPIError && error.code === 404) {
                return { data: null, ...immutableCacheTtl };
            }

            throw error;
        }
    },
);

/**
 * Get a document by its ID.
 */
export const getDocument = cache(
    'api.getDocument',
    async (spaceId: string, documentId: string, options: CacheFunctionOptions) => {
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
        return cacheResponse(response, immutableCacheTtl);
    },
);

/**
 * Get the customization settings for a space from the API.
 */
export const getSpaceCustomizationFromAPI = cache(
    'api.getSpaceCustomization',
    async (spaceId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getSpacePublishingCustomizationById(spaceId, {
            signal: options.signal,
            ...noCacheFetchOptions,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
        });
    },
);

/**
 * Get the customization settings for a space from the API.
 */
export async function getSpaceCustomization(spaceId: string): Promise<CustomizationSettings> {
    const headersList = headers();
    const raw = await getSpaceCustomizationFromAPI(spaceId);

    const extend = headersList.get('x-gitbook-customization');
    if (extend) {
        try {
            const parsed = rison.decode_object<Partial<CustomizationSettings>>(extend);
            return { ...raw, ...parsed };
        } catch (error) {
            console.error('Failed to parse x-gitbook-customization header (ignored)', error);
        }
    }

    return raw;
}

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = cache(
    'api.getCollection',
    async (collectionId: string, options: CacheFunctionOptions) => {
        const response = await api().collections.getCollectionById(collectionId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            revalidateBefore: 60 * 60,
            tags: [getAPICacheTag({ tag: 'collection', collection: collectionId })],
        });
    },
);

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = cache(
    'api.getCollectionSpaces',
    async (collectionId: string, options: CacheFunctionOptions) => {
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
            tags: [getAPICacheTag({ tag: 'collection', collection: collectionId })],
        });
    },
);

/**
 * Fetch all the data to render a space at once.
 */
export async function getSpaceData(pointer: ContentPointer) {
    const [{ space, pages, contentTarget }, { customization, scripts }] = await Promise.all([
        getSpaceContentData(pointer),
        getSpaceLayoutData(pointer.spaceId),
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
 * Fetch all the content data about a space at once.
 * This function executes the requests in parallel and should be used as early as possible
 * instead of calling the individual functions.
 */
export async function getSpaceContentData(pointer: ContentPointer) {
    const [space, changeRequest] = await Promise.all([
        getSpace(pointer.spaceId),
        pointer.changeRequestId ? getChangeRequest(pointer.spaceId, pointer.changeRequestId) : null,
    ]);

    const contentTarget: ContentTarget = {
        spaceId: pointer.spaceId,
        revisionId: changeRequest?.revision ?? pointer.revisionId ?? space.revision,
    };
    const [pages] = await Promise.all([getRevisionPages(space.id, contentTarget.revisionId)]);

    return {
        space,
        pages,
        contentTarget,
    };
}

/**
 * Fetch all the layout data about a space at once.
 */
export async function getSpaceLayoutData(spaceId: string) {
    const [customization, scripts] = await Promise.all([
        getSpaceCustomization(spaceId),
        getSpaceIntegrationScripts(spaceId),
    ]);

    return {
        customization,
        scripts,
    };
}

/**
 * Search content in a space.
 */
export const searchSpaceContent = cache(
    'api.searchSpaceContent',
    async (
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
        return cacheResponse(response, {
            tags: [],
        });
    },
);

/**
 * Search content accross all spaces in a collection.
 */
export const searchCollectionContent = cache(
    'api.searchCollectionContent',
    async (collectionId: string, query: string, options: CacheFunctionOptions) => {
        const response = await api().search.searchContent(
            { query },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response, {
            ttl: 60 * 60,
            tags: [],
        });
    },
);

/**
 * Get a list of recommended questions in a space.
 */
export const getRecommendedQuestionsInSpace = cache(
    'api.getRecommendedQuestionsInSpace',
    async (spaceId: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.getRecommendedQuestionsInSpace(spaceId, {
            ...noCacheFetchOptions,
            signal: options.signal,
        });
        return cacheResponse(response, {
            tags: [],
        });
    },
);

/**
 * Render an integration contentkit UI
 */
export const renderIntegrationUi = cache(
    'api.renderIntegrationUi',
    async (
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
        return cacheResponse(response, {
            tags: [],
        });
    },
);

/**
 * Create a cache tag for the API.
 */
export function getAPICacheTag(
    spec: // All data related to a space
    | {
              tag: 'space';
              space: string;
          }
        // All data related to a collection
        | {
              tag: 'collection';
              collection: string;
          },
): string {
    switch (spec.tag) {
        case 'space':
            return `space:${spec.space}`;
        case 'collection':
            return `collection:${spec.collection}`;
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
export async function ignoreAPIError<T>(promise: Promise<T>): Promise<T | null> {
    try {
        return await promise;
    } catch (error) {
        const code = (error as GitBookAPIError).code;
        if (code >= 400 && code < 500) {
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
): Promise<
    HttpResponse<
        List & {
            items: T[];
        },
        E
    >
> {
    const limit = 100;

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
