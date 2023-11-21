import 'server-only';

import { ContentVisibility, GitBookAPI, JSONDocument } from '@gitbook/api';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';

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
export const getSpace = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().spaces.getSpaceById(spaceId);
        return data;
    },
    ['api', 'spaces'],
    {
        tags: ['api', 'spaces'],
    },
);

/**
 * Get the current revision of a space
 */
export const getCurrentRevision = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().spaces.getCurrentRevision(spaceId);
        return data;
    },
    ['api', 'revisions'],
    {
        tags: ['api', 'revisions'],
    },
);

/**
 * Get the document for a page.
 */
export const getPageDocument = unstable_cache(
    async (spaceId: string, revisionId: string, pageId: string) => {
        const { data } = await api().spaces.getPageInRevisionById(spaceId, revisionId, pageId);
        // @ts-ignore
        return data.document as JSONDocument;
    },
    ['api', 'documents'],
    {
        tags: ['api', 'documents'],
    },
);

/**
 * Get the customization settings for a space.
 */
export const getSpaceCustomization = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().spaces.getSpacePublishingCustomizationById(spaceId);
        return data;
    },
    ['api', 'customization'],
    {
        tags: ['api', 'customization'],
    },
);

/**
 * Get the infos about a collection by its ID.
 */
export const getCollection = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().collections.getCollectionById(spaceId);
        return data;
    },
    ['api', 'collections'],
    {
        tags: ['api', 'collections'],
    },
);

/**
 * List all the spaces variants published in a collection.
 */
export const getCollectionSpaces = unstable_cache(
    async (spaceId: string) => {
        const { data } = await api().collections.listSpacesInCollectionById(spaceId);
        // TODO: do this filtering on the API side
        return data.items.filter((space) => space.visibility === ContentVisibility.InCollection);
    },
    ['api', 'collections', 'spaces'],
    {
        tags: ['api', 'collections'],
    },
);
