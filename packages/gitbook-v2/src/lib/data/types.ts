import type * as api from '@gitbook/api';

/**
 * Generic fetcher for GitBook data.
 * It is used between v1 and v2.
 */
export interface GitBookDataFetcher {
    /**
     * Endpoint of the API.
     */
    apiEndpoint: string;

    /**
     * Get a user by its ID.
     */
    getUserById(userId: string): Promise<api.User | null>;

    /**
     * Get a published content by its URL.
     */
    getPublishedContentByUrl(params: {
        url: string;
        visitorAuthToken?: string;
        redirectOnError?: boolean;
    }): Promise<api.PublishedSiteContentLookup>;

    /**
     * Get a published content site by its organization ID and site ID.
     */
    getPublishedContentSite(params: {
        organizationId: string,
        siteId: string,
        siteShareKey: string | undefined;
    }): Promise<api.PublishedContentSite>;
}
