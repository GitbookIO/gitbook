import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';

import {
    ContentRefSyncedBlock,
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

export interface ContentPointer {
    spaceId: string;
    changeRequestId?: string;
    revisionId?: string;
}

const apiSyncStorage = new AsyncLocalStorage<GitBookAPI>();

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
                tags: [],
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
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
                tags: [],
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
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
            const response = await api().request<PublishedContentLookup>({
                method: 'GET',
                path: '/urls/published',
                query: {
                    url,
                    visitorAuthToken,
                },
                secure: false,
                format: 'json',
                signal: options.signal,
                ...noCacheFetchOptions,
            });

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
            tags: [],
        });
    },
    {
        // We don't cache for long s we currently don't invalidate change-request cache
        defaultTtl: 60 * 60,
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

        return cacheResponse(response, {
            data: response.data,
            tags: [
                // Revision are immutable so we don't cache
            ],
        });
    },
);

/**
 * Get all the pages in the space.
 */
export const getRevisionPages = cache(
    'api.getRevisionPages',
    async (pointer: ContentPointer, options: CacheFunctionOptions) => {
        const response = await (async () => {
            if (pointer.revisionId) {
                return api().spaces.listPagesInRevisionById(pointer.spaceId, pointer.revisionId, {
                    ...noCacheFetchOptions,
                    signal: options.signal,
                });
            }

            if (pointer.changeRequestId) {
                return api().spaces.listPagesInChangeRequest(
                    pointer.spaceId,
                    pointer.changeRequestId,
                    {
                        ...noCacheFetchOptions,
                        signal: options.signal,
                    },
                );
            }

            return api().spaces.listPages(pointer.spaceId, {
                ...noCacheFetchOptions,
                signal: options.signal,
            });
        })();

        return cacheResponse(response, {
            data: response.data.pages,
            tags: [getAPICacheTag({ tag: 'space', space: pointer.spaceId })],
        });
    },
);

/**
 * Get a revision page by its path
 */
export const getRevisionPageByPath = cache(
    'api.getRevisionPageByPath.v2',
    async (pointer: ContentPointer, pagePath: string, options: CacheFunctionOptions) => {
        const encodedPath = encodeURIComponent(pagePath);

        try {
            const response = await (async () => {
                if (pointer.revisionId) {
                    return api().spaces.getPageInRevisionByPath(
                        pointer.spaceId,
                        pointer.revisionId,
                        encodedPath,
                        {},
                        {
                            ...noCacheFetchOptions,
                            signal: options.signal,
                        },
                    );
                }

                if (pointer.changeRequestId) {
                    return api().spaces.getPageInChangeRequestByPath(
                        pointer.spaceId,
                        pointer.changeRequestId,
                        encodedPath,
                        {},
                        {
                            ...noCacheFetchOptions,
                            signal: options.signal,
                        },
                    );
                }

                return api().spaces.getPageByPath(
                    pointer.spaceId,
                    encodedPath,
                    {},
                    {
                        ...noCacheFetchOptions,
                        signal: options.signal,
                    },
                );
            })();

            return cacheResponse(response, {
                data: response.data,
                tags: [getAPICacheTag({ tag: 'space', space: pointer.spaceId })],
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
                    data: null,
                    tags: [getAPICacheTag({ tag: 'space', space: pointer.spaceId })],
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
    'api.getRevisionFile',
    async (pointer: ContentPointer, fileId: string, options: CacheFunctionOptions) => {
        try {
            const response = await (async () => {
                if (pointer.revisionId) {
                    return api().spaces.getFileInRevisionById(
                        pointer.spaceId,
                        pointer.revisionId,
                        fileId,
                        {
                            ...noCacheFetchOptions,
                            signal: options.signal,
                        },
                    );
                }

                if (pointer.changeRequestId) {
                    return api().spaces.getFileInChangeRequestById(
                        pointer.spaceId,
                        pointer.changeRequestId,
                        fileId,
                        {
                            ...noCacheFetchOptions,
                            signal: options.signal,
                        },
                    );
                }

                return api().spaces.getFileById(pointer.spaceId, fileId, {
                    ...noCacheFetchOptions,
                });
            })();

            return cacheResponse(response, {
                tags: [getAPICacheTag({ tag: 'space', space: pointer.spaceId })],
            });
        } catch (error: any) {
            if (error instanceof GitBookAPIError && error.code === 404) {
                return { data: null };
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
        return cacheResponse(response, {
            tags: [
                // No tags as documents are immutable
            ],
        });
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
            data: response.data.items.filter(
                (space) => space.visibility === ContentVisibility.InCollection,
            ),
            tags: [getAPICacheTag({ tag: 'collection', collection: collectionId })],
        });
    },
);

/**
 * Fetch all the information about a space at once.
 * This function executes the requests in parallel and should be used as early as possible
 * instead of calling the individual functions.
 */
export async function getSpaceContent(pointer: ContentPointer) {
    const [space, pages, customization, scripts] = await Promise.all([
        getSpace(pointer.spaceId),
        getRevisionPages(pointer),
        getSpaceCustomization(pointer.spaceId),
        getSpaceIntegrationScripts(pointer.spaceId),
    ]);

    return {
        space,
        pages,
        customization,
        scripts,
    };
}

/**
 * Search content in a space.
 */
export const searchSpaceContent = cache(
    'api.searchSpaceContent',
    async (spaceId: string, query: string, options: CacheFunctionOptions) => {
        const response = await api().spaces.searchSpaceContent(
            spaceId,
            { query },
            {
                ...noCacheFetchOptions,
                signal: options.signal,
            },
        );
        return cacheResponse(response, {
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
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
            tags: [getAPICacheTag({ tag: 'collection', collection: collectionId })],
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
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
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
