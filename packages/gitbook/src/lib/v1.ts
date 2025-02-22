import type { GitBookDataFetcher } from '@v2/lib/data/types';

import {
    api,
    getPublishedContentByUrl,
    getPublishedContentSite,
    getRevisionFile,
    getUserById,
} from './api';

/*
 * Code that will be used until the migration to v2 is complete.
 */

/**
 * Data fetcher that uses the old code of the v1.
 * Try not to use this as much as possible, and instead take the data fetcher from the props.
 * This data fetcher should only be used at the top of the tree.
 */
export async function getDataFetcherV1(): Promise<GitBookDataFetcher> {
    const apiClient = await api();

    return {
        apiEndpoint: apiClient.client.endpoint,

        getUserById(userId) {
            return getUserById(userId);
        },

        // @ts-ignore - types are compatible enough, and this will not be called in v1 this way
        getPublishedContentByUrl(params) {
            return getPublishedContentByUrl(
                params.url,
                params.visitorAuthToken,
                params.redirectOnError ? true : undefined,
            );
        },

        getPublishedContentSite(params) {
            return getPublishedContentSite(params);
        },

        getRevisionFile(params) {
            return getRevisionFile(params.spaceId, params.revisionId, params.fileId);
        },
    };
}
