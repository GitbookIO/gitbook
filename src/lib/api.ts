import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';

import {
    ContentVisibility,
    GitBookAPI,
    GitBookAPIError,
    JSONDocument,
    PublishedContentLookup,
    SearchAIAnswer,
} from '@gitbook/api';
import assertNever from 'assert-never';
import { headers } from 'next/headers';

import { cache, cacheResponse, noCacheFetchOptions, parseCacheResponse } from './cache';

export interface ContentPointer {
    spaceId: string;
    changeRequestId?: string;
    revisionId?: string;
}

const apiSyncStorage = new AsyncLocalStorage<GitBookAPI>();

/**
 * Create an API client for the current request.
 */
export function api(): GitBookAPI {
    const existing = apiSyncStorage.getStore();
    if (existing) {
        return existing;
    }

    const headersList = headers();
    const apiEndpoint = headersList.get('x-gitbook-api') ?? undefined;
    const apiToken = headersList.get('x-gitbook-token');

    if (!apiToken) {
        throw new Error(
            'Missing GitBook API token, please check that the request is correctly processed by the middleware',
        );
    }

    const gitbook = new GitBookAPI({
        authToken: apiToken,
        endpoint: apiEndpoint,
    });

    return gitbook;
}

/**
 * Use an API client for an async function.
 */
export function withAPI<T>(client: GitBookAPI, fn: () => Promise<T>): Promise<T> {
    return apiSyncStorage.run(client, fn);
}

export type PublishedContentWithCache = PublishedContentLookup & {
    cacheMaxAge?: number;
    cacheTags?: string[];
};

/**
 * Resolve a URL to the content to render.
 */
export const getPublishedContentByUrl = cache(
    'api.getPublishedContentByUrl',
    async (
        url: string,
        visitorAuthToken: string | undefined,
        options: {
            signal?: AbortSignal;
        },
    ) => {
        const { signal } = options;

        // If the request is aborted, we don't need to make the API call
        // We call it as this logic is wrapped in an asynchronous cache that is not tied to the signal.
        signal?.throwIfAborted();

        const response = await api().request<PublishedContentLookup>({
            method: 'GET',
            path: '/urls/published',
            query: {
                url,
                visitorAuthToken,
            },
            secure: false,
            format: 'json',
            signal: signal,
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
    },
    {
        // Do not pass the options for the cache key
        extractArgs: (args) => args.slice(0, 2),
    },
);

/**
 * Get a space by its ID.
 */
export const getSpace = cache('api.getSpace', async (spaceId: string) => {
    const response = await api().spaces.getSpaceById(spaceId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response, {
        tags: [
            getAPICacheTag({ tag: 'space', space: spaceId }),
            getAPICacheTag({ tag: 'space-customization', space: spaceId }),
        ],
    });
});

/**
 * List the scripts to load for the space.
 */
export const getSpaceIntegrationScripts = cache(
    'api.getSpaceIntegrationScripts',
    async (spaceId: string) => {
        const response = await api().spaces.listSpaceIntegrationScripts(spaceId, {
            ...noCacheFetchOptions,
        });
        return cacheResponse(response, {
            tags: [
                getAPICacheTag({ tag: 'space', space: spaceId }),
                getAPICacheTag({ tag: 'space-customization', space: spaceId }),
            ],
        });
    },
);

/**
 * Get all the pages in the space.
 */
export const getRevisionPages = cache('api.getRevisionPages', async (pointer: ContentPointer) => {
    const response = await (async () => {
        if (pointer.revisionId) {
            return api().spaces.listPagesInRevisionById(pointer.spaceId, pointer.revisionId, {
                ...noCacheFetchOptions,
            });
        }

        if (pointer.changeRequestId) {
            return api().spaces.listPagesInChangeRequest(spaceId, pointer.changeRequestId, {
                ...noCacheFetchOptions,
            });
        }

        return api().spaces.listPages(pointer.spaceId, {
            ...noCacheFetchOptions,
        });
    })();

    return cacheResponse(response, {
        data: response.data.pages,
        tags: [
            getAPICacheTag({ tag: 'space', space: pointer.spaceId }),
            getAPICacheTag({ tag: 'space-pages', space: pointer.spaceId }),
        ],
    });
});

/**
 * Get a revision page by its path
 */
export const getRevisionPageByPath = cache(
    'api.getRevisionPageByPath',
    async (pointer: ContentPointer, pagePath: string) => {
        try {
            const response = await (async () => {
                if (pointer.revisionId) {
                    return api().spaces.getPageInRevisionByPath(
                        pointer.spaceId,
                        pointer.revisionId,
                        pagePath,
                        {},
                        {
                            ...noCacheFetchOptions,
                        },
                    );
                }

                if (pointer.changeRequestId) {
                    return api().spaces.getPageInChangeRequestByPath(
                        spaceId,
                        pointer.changeRequestId,
                        pagePath,
                        {},
                        {
                            ...noCacheFetchOptions,
                        },
                    );
                }

                return api().spaces.getPageByPath(
                    pointer.spaceId,
                    pagePath,
                    {},
                    {
                        ...noCacheFetchOptions,
                    },
                );
            })();

            return cacheResponse(response, {
                data: response.data,
                tags: [
                    getAPICacheTag({ tag: 'space', space: pointer.spaceId }),
                    getAPICacheTag({ tag: 'space-pages', space: pointer.spaceId }),
                ],
            });
        } catch (error) {
            if ((error as GitBookAPIError).code === 404) {
                return {
                    data: null,
                    tags: [
                        getAPICacheTag({ tag: 'space', space: pointer.spaceId }),
                        getAPICacheTag({ tag: 'space-pages', space: pointer.spaceId }),
                    ],
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
    async (pointer: ContentPointer, fileId: string) => {
        try {
            const response = await (async () => {
                if (pointer.revisionId) {
                    return api().spaces.getFileInRevisionById(
                        pointer.spaceId,
                        pointer.revisionId,
                        fileId,
                        {
                            ...noCacheFetchOptions,
                        },
                    );
                }

                if (pointer.changeRequestId) {
                    return api().spaces.getFileInChangeRequestById(
                        spaceId,
                        pointer.changeRequestId,
                        fileId,
                        {
                            ...noCacheFetchOptions,
                        },
                    );
                }

                return api().spaces.getFileById(pointer.spaceId, fileId, {
                    ...noCacheFetchOptions,
                });
            })();

            return cacheResponse(response, {
                tags: [
                    getAPICacheTag({ tag: 'space', space: pointer.spaceId }),
                    getAPICacheTag({ tag: 'space-files', space: pointer.spaceId }),
                    getAPICacheTag({ tag: 'space-file', space: pointer.spaceId, file: fileId }),
                ],
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
export const getDocument = cache('api.getDocument', async (spaceId: string, documentId: string) => {
    const response = await api().spaces.getDocumentById(spaceId, documentId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response, {
        tags: [
            // No tags as documents are immutable
        ],
    });
});

/**
 * Get the customization settings for a space.
 */
export const getSpaceCustomization = cache('api.getSpaceCustomization', async (spaceId: string) => {
    const response = await api().spaces.getSpacePublishingCustomizationById(spaceId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response, {
        tags: [
            getAPICacheTag({ tag: 'space', space: spaceId }),
            getAPICacheTag({ tag: 'space-customization', space: spaceId }),
        ],
    });
});

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = cache('api.getCollection', async (collectionId: string) => {
    const response = await api().collections.getCollectionById(collectionId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response, {
        tags: [getAPICacheTag({ tag: 'collection', collection: collectionId })],
    });
});

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = cache(
    'api.getCollectionSpaces',
    async (collectionId: string) => {
        const response = await api().collections.listSpacesInCollectionById(
            collectionId,
            {},
            {
                ...noCacheFetchOptions,
            },
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
    async (spaceId: string, query: string) => {
        const response = await api().spaces.searchSpaceContent(
            spaceId,
            { query },
            {
                ...noCacheFetchOptions,
            },
        );
        return cacheResponse(response, {
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
        });
    },
);

/**
 * Ask question in a space.
 */
export const askQueryInSpace = cache(
    'api.askQueryInSpace',
    async (spaceId: string, query: string) => {
        const response = await api().spaces.askQueryInSpace(
            spaceId,
            { query },
            {
                format: 'document',
            },
            {
                ...noCacheFetchOptions,
            },
        );

        return cacheResponse(response, {
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
        });
    },
);

/**
 * Get a list of recommended questions in a space.
 */
export const getRecommendedQuestionsInSpace = cache(
    'api.getRecommendedQuestionsInSpace',
    async (spaceId: string) => {
        const response = await api().spaces.getRecommendedQuestionsInSpace(spaceId, {
            ...noCacheFetchOptions,
        });
        return cacheResponse(response, {
            tags: [getAPICacheTag({ tag: 'space', space: spaceId })],
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
        // Customization info for a space
        | {
              tag: 'space-customization';
              space: string;
          }
        // Pages in a space
        | {
              tag: 'space-pages';
              space: string;
          }
        // All files in a space
        | {
              tag: 'space-files';
              space: string;
          }
        // A specific file in a space
        | {
              tag: 'space-file';
              space: string;
              file: string;
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
        case 'space-customization':
            return `space:${spec.space}.customization`;
        case 'space-pages':
            return `space:${spec.space}.pages`;
        case 'space-files':
            return `space:${spec.space}.files`;
        case 'space-file':
            return `space:${spec.space}.file:${spec.file}`;
        case 'collection':
            return `collection:${spec.collection}`;
        default:
            assertNever(spec);
    }
}
