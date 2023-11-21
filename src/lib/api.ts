import 'server-only';

import { ContentVisibility, GitBookAPI, JSONDocument } from '@gitbook/api';
import { headers } from 'next/headers';

import { cache } from './cache';

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
    async (spaceId: string, revisionId: string, pageId: string) => {
        const { data } = await api().spaces.getPageInRevisionById(
            spaceId,
            revisionId,
            pageId,
            {},
            {
                cache: 'no-store',
            },
        );
        // @ts-ignore
        return data.document as JSONDocument;
    },
);

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
export const getCollection = cache('api.getCollection', async (spaceId: string) => {
    const { data } = await api().collections.getCollectionById(spaceId, {
        cache: 'no-store',
    });
    return data;
});

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = cache('api.getCollectionSpaces', async (spaceId: string) => {
    const { data } = await api().collections.listSpacesInCollectionById(
        spaceId,
        {},
        {
            cache: 'no-store',
        },
    );
    // TODO: do this filtering on the API side
    return data.items.filter((space) => space.visibility === ContentVisibility.InCollection);
});
