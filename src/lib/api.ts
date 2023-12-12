import 'server-only';

import {
    ContentVisibility,
    GitBookAPI,
    GitBookAPIError,
    PublishedContentLookup,
    Space,
} from '@gitbook/api';
import assertNever from 'assert-never';
import { headers } from 'next/headers';

import { cache, cacheResponse, noCacheFetchOptions, parseCacheResponse } from './cache';

export interface ContentPointer {
    spaceId: string;
    changeRequestId?: string;
    revisionId?: string;
}

/**
 * Create an API client for the current request.
 */
export function api(): GitBookAPI {
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
        apiEndpoint: string | undefined,
        visitorAuthToken: string | undefined,
        options: {
            signal?: AbortSignal;
        },
    ) => {
        const { signal } = options;

        // If the request is aborted, we don't need to make the API call
        // We call it as this logic is wrapped in an asynchronous cache that is not tied to the signal.
        signal?.throwIfAborted();

        const gitbook = new GitBookAPI({
            endpoint: apiEndpoint,
        });

        const response = await gitbook.request<PublishedContentLookup>({
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
        extractArgs: (args) => args.slice(0, 3),
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
 * Get the current revision of a space
 */
export const getCurrentRevision = cache('api.getCurrentRevision', async (spaceId: string) => {
    const response = await api().spaces.getCurrentRevision(spaceId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response, {
        tags: [
            getAPICacheTag({ tag: 'space', space: spaceId }),
            getAPICacheTag({ tag: 'space-pages', space: spaceId }),
            getAPICacheTag({ tag: 'space-files', space: spaceId }),
        ],
    });
});

/**
 * Get a document by its ID.
 */
export const getDocument = cache('api.getDocument', async (spaceId: string, documentId: string) => {
    const response = await api().spaces.getDocumentById(spaceId, documentId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response, {
        tags: [
            getAPICacheTag({ tag: 'space', space: spaceId }),
            getAPICacheTag({ tag: 'space-documents', space: spaceId }),
            getAPICacheTag({ tag: 'space-document', space: spaceId, document: documentId }),
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
        // @ts-ignore
        return cacheResponse<Space[]>(response, {
            data: response.data.items.filter(
                (space) => space.visibility === ContentVisibility.InCollection,
            ),
            tags: [getAPICacheTag({ tag: 'collection', collection: collectionId })],
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
        // All documents in a space
        | {
              tag: 'space-documents';
              space: string;
          }
        // A specific document in a space
        | {
              tag: 'space-document';
              space: string;
              document: string;
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
        case 'space-documents':
            return `space:${spec.space}.documents`;
        case 'space-document':
            return `space:${spec.space}.document:${spec.document}`;
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
