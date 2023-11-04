import 'server-only';

import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';
import { GitBookAPI, JSONDocument } from '@gitbook/api';

/**
 * Create an API client for the current request.
 */
export function api(): GitBookAPI {
    const headersList = headers();
    const apiToken = headersList.get('x-gitbook-token');

    const gitbook = new GitBookAPI({
        authToken: apiToken || process.env.GITBOOK_TOKEN,
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
        // TODO: use function from API client once updated
        const { data } = await api().request({
            method: 'GET',
            path: `/spaces/${spaceId}/publishing/customization`,
            secure: true,
            format: 'json',
        });
        return data;
    },
    ['api', 'customization'],
    {
        tags: ['api', 'customization'],
    },
);
