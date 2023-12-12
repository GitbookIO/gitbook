import 'server-only';

import {
    ContentVisibility,
    GitBookAPI,
    GitBookAPIError,
    PublishedContentLookup,
} from '@gitbook/api';
import { headers } from 'next/headers';

import { cache, cacheResponse } from './cache';

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
        console.log('getPublishedContentByUrl', signal?.aborted);
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
            // Cloudflare doesn't support the `cache` directive before next-on-pages patches the fetch function
            // https://github.com/cloudflare/workerd/issues/698
            // cache: 'no-store',
            next: { revalidate: 0 },
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
        cache: 'no-store',
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
                cache: 'no-store',
            });
        }

        if (pointer.changeRequestId) {
            return api().spaces.listPagesInChangeRequest(spaceId, pointer.changeRequestId, {
                cache: 'no-store',
            });
        }

        return api().spaces.listPages(pointer.spaceId, {
            cache: 'no-store',
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
                            cache: 'no-store',
                        },
                    );
                }

                if (pointer.changeRequestId) {
                    return api().spaces.getFileInChangeRequestById(
                        spaceId,
                        pointer.changeRequestId,
                        fileId,
                        {
                            cache: 'no-store',
                        },
                    );
                }

                return api().spaces.getFileById(pointer.spaceId, fileId, {
                    cache: 'no-store',
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
        cache: 'no-store',
    });
    return cacheResponse(response);
});

/**
 * Get a document by its ID.
 */
export const getDocument = cache('api.getDocument', async (spaceId: string, documentId: string) => {
    const response = await api().spaces.getDocumentById(spaceId, documentId, {
        cache: 'no-store',
    });
    return cacheResponse(response);
});

/**
 * Get the customization settings for a space.
 */
export const getSpaceCustomization = cache('api.getSpaceCustomization', async (spaceId: string) => {
    const response = await api().spaces.getSpacePublishingCustomizationById(spaceId, {
        cache: 'no-store',
    });
    return cacheResponse(response);
});

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = cache('api.getCollection', async (collectionId: string) => {
    const response = await api().collections.getCollectionById(collectionId, {
        cache: 'no-store',
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
                cache: 'no-store',
            },
        );
        // TODO: do this filtering on the API side
        return {
            data: data.items.filter((space) => space.visibility === ContentVisibility.InCollection),
        };
    },
);
