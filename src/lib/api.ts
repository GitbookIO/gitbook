import 'server-only';

import { ContentVisibility, GitBookAPI, JSONDocument } from '@gitbook/api';
import { headers } from 'next/headers';

import { cache } from './cache';

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
    const apiToken = headersList.get('x-gitbook-token');

    if (!apiToken) {
        throw new Error(
            'Missing GitBook API token, please check that the request is correctly processed by the middleware',
        );
    }

    const gitbook = new GitBookAPI({
        authToken: apiToken,
        endpoint: process.env.GITBOOK_API_URL,
    });

    return gitbook;
}

/**
 * Get a space by its ID.
 */
export const getSpace = cache('api.getSpace', async (spaceId: string) => {
    const { data } = await api().spaces.getSpaceById(spaceId, {
        cache: 'no-store',
    });
    return data;
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
    return data.pages!;
});

/**
 * Resolve a file by its ID.
 */
export const getRevisionFile = cache(
    'api.getRevisionFile',
    async (pointer: ContentPointer, fileId: string) => {
        try {
            const { data } = await (async () => {
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
            return data;
        } catch (error) {
            // TODO: improve error handling to throw non-404
            return null;
        }
    },
);

/**
 * Get the current revision of a space
 */
export const getCurrentRevision = cache('api.getCurrentRevision', async (spaceId: string) => {
    const { data } = await api().spaces.getCurrentRevision(spaceId, {
        cache: 'no-store',
    });
    return data;
});

/**
 * Get the document for a page.
 */
export const getPageDocument = cache(
    'api.getPageDocument',
    async (pointer: ContentPointer, pageId: string) => {
        const { data } = await (async () => {
            if (pointer.revisionId) {
                return api().spaces.getPageInRevisionById(
                    pointer.spaceId,
                    pointer.revisionId,
                    pageId,
                    {
                        format: 'document',
                    },
                    {
                        cache: 'no-store',
                    },
                );
            }

            if (pointer.changeRequestId) {
                return api().spaces.getPageInChangeRequestById(
                    pointer.spaceId,
                    pointer.changeRequestId,
                    pageId,
                    {
                        format: 'document',
                    },
                    {
                        cache: 'no-store',
                    },
                );
            }

            return api().spaces.getPageById(
                pointer.spaceId,
                pageId,
                {
                    format: 'document',
                },
                {
                    cache: 'no-store',
                },
            );
        })();
        // @ts-ignore
        return data.document as JSONDocument;
    },
);

/**
 * Get a document by its ID.
 */
export const getDocument = cache('api.getDocument', async (spaceId: string, documentId: string) => {
    // TODO
});

/**
 * Get the customization settings for a space.
 */
export const getSpaceCustomization = cache('api.getSpaceCustomization', async (spaceId: string) => {
    const { data } = await api().spaces.getSpacePublishingCustomizationById(spaceId, {
        cache: 'no-store',
    });
    return data;
});

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = cache('api.getCollection', async (collectionId: string) => {
    const { data } = await api().collections.getCollectionById(collectionId, {
        cache: 'no-store',
    });
    return data;
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
        return data.items.filter((space) => space.visibility === ContentVisibility.InCollection);
    },
);
