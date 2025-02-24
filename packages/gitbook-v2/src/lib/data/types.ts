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
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
    }): Promise<api.PublishedContentSite>;

    /**
     * Get a space by its ID.
     */
    getSpace(params: { spaceId: string; shareKey: string | undefined }): Promise<api.Space>;

    /**
     * Get a change request by its space ID and change request ID.
     */
    getChangeRequest(params: {
        spaceId: string;
        changeRequestId: string;
    }): Promise<api.ChangeRequest | null>;

    /**
     * Get the revision pages by its space ID and revision ID.
     */
    getRevisionPages(params: {
        spaceId: string;
        revisionId: string;
        metadata: boolean;
    }): Promise<api.RevisionPage[]>;

    /**
     * Get a revision file by its space ID, revision ID and file ID.
     */
    getRevisionFile(params: {
        spaceId: string;
        revisionId: string;
        fileId: string;
    }): Promise<api.RevisionFile | null>;

    /**
     * Get a document by its space ID and document ID.
     */
    getDocument(params: {   
        spaceId: string;
        documentId: string;
    }): Promise<api.JSONDocument>;

    /**
     * Get a computed document by its space ID and computed source.
     */
    getComputedDocument(params: {
        spaceId: string;
        source: api.ComputedContentSource;
    }): Promise<api.JSONDocument>;

    /**
     * Get a reusable content by its space ID, revision ID and reusable content ID.
     */
    getReusableContent(params: {
        spaceId: string;
        revisionId: string;
        reusableContentId: string;
    }): Promise<api.RevisionReusableContent | null>;

    /**
     * Get the latest OpenAPI spec version content by its organization ID and slug.
     */
    getLatestOpenAPISpecVersionContent(params: {
        organizationId: string;
        slug: string;
    }): Promise<api.OpenAPISpecContent | null>;
}
