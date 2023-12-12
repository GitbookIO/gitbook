import 'server-only';

import {
    ContentVisibility,
    GitBookAPI,
    GitBookAPIError,
    PublishedContentLookup,
} from '@gitbook/api';
import { headers } from 'next/headers';

import { cache, cacheResponse, noCacheFetchOptions } from './cache';

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

        return cacheResponse(response);
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
    return cacheResponse(response);
});

/**
 * Get all the pages in the space.
 */
export const getRevisionPages = cache('api.getRevisionPages', async (pointer: ContentPointer) => {
    const { data } = await (async () => {
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
    return { data: data.pages! };
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
            return cacheResponse(response);
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
    return cacheResponse(response);
});

/**
 * Get a document by its ID.
 */
export const getDocument = cache('api.getDocument', async (spaceId: string, documentId: string) => {
    const response = await api().spaces.getDocumentById(spaceId, documentId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response);
});

/**
 * Get the customization settings for a space.
 */
export const getSpaceCustomization = cache('api.getSpaceCustomization', async (spaceId: string) => {
    const response = await api().spaces.getSpacePublishingCustomizationById(spaceId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response);
});

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = cache('api.getCollection', async (collectionId: string) => {
    const response = await api().collections.getCollectionById(collectionId, {
        ...noCacheFetchOptions,
    });
    return cacheResponse(response);
});

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = cache(
    'api.getCollectionSpaces',
    async (collectionId: string) => {
        const { data } = await api().collections.listSpacesInCollectionById(
            collectionId,
            {},
            {
                ...noCacheFetchOptions,
            },
        );
        // TODO: do this filtering on the API side
        return {
            data: data.items.filter((space) => space.visibility === ContentVisibility.InCollection),
        };
    },
);
