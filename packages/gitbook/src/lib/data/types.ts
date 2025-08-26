import type * as api from '@gitbook/api';

export type DataFetcherErrorData = {
    code: number;
    message: string;
    cache?: {
        maxAge?: number;
        staleWhileRevalidate?: number;
    };
};

export type DataFetcherResponse<T> =
    | {
          data: T;
          error?: undefined;
      }
    | {
          error: DataFetcherErrorData;
          data?: undefined;
      };

/**
 * Generic fetcher for GitBook data.
 * It is used between v1 and v2.
 */
export interface GitBookDataFetcher {
    /**
     * Get an API client for the current context.
     */
    api(): Promise<api.GitBookAPI>;

    /**
     * Create a data fetcher authenticated with a specific token.
     */
    withToken(input: {
        apiToken: string;
    }): GitBookDataFetcher;

    /**
     * Get a user by its ID.
     */
    getUserById(userId: string): Promise<DataFetcherResponse<api.User>>;

    /**
     * Get a published content site by its organization ID and site ID.
     */
    getPublishedContentSite(params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
    }): Promise<DataFetcherResponse<api.PublishedContentSite>>;

    /**
     * Get a space by its ID.
     */
    getSpace(params: { spaceId: string; shareKey: string | undefined }): Promise<
        DataFetcherResponse<api.Space>
    >;

    /**
     * Get a change request by its space ID and change request ID.
     */
    getChangeRequest(params: {
        spaceId: string;
        changeRequestId: string;
    }): Promise<DataFetcherResponse<api.ChangeRequest>>;

    /**
     * Get the revision by its space ID and revision ID.
     */
    getRevision(params: {
        spaceId: string;
        revisionId: string;
    }): Promise<DataFetcherResponse<api.Revision>>;

    /**
     * Get a revision page by its path.
     */
    getRevisionPageByPath(params: {
        spaceId: string;
        revisionId: string;
        path: string;
    }): Promise<DataFetcherResponse<api.RevisionPageDocument | api.RevisionPageGroup>>;

    /**
     * Get the markdown content of a page by its path.
     */
    getRevisionPageMarkdown(params: {
        spaceId: string;
        revisionId: string;
        pageId: string;
    }): Promise<DataFetcherResponse<string>>;

    /**
     * Get the document of a page by its path.
     */
    getRevisionPageDocument(params: {
        spaceId: string;
        revisionId: string;
        pageId: string;
    }): Promise<DataFetcherResponse<api.JSONDocument>>;

    /**
     * Get the document of a reusable content by its space ID and reusable content ID.
     */
    getRevisionReusableContentDocument(params: {
        spaceId: string;
        revisionId: string;
        reusableContentId: string;
    }): Promise<DataFetcherResponse<api.JSONDocument>>;

    /**
     * Get a document by its space ID and document ID.
     */
    getDocument(params: { spaceId: string; documentId: string }): Promise<
        DataFetcherResponse<api.JSONDocument>
    >;

    /**
     * Get a computed document by its space ID and computed source.
     */
    getComputedDocument(params: {
        organizationId: string;
        spaceId: string;
        source: api.ComputedContentSource;
        seed: string;
    }): Promise<DataFetcherResponse<api.JSONDocument>>;

    /**
     * Get the latest OpenAPI spec version content by its organization ID and slug.
     */
    getLatestOpenAPISpecVersionContent(params: {
        organizationId: string;
        slug: string;
    }): Promise<DataFetcherResponse<api.OpenAPISpecContent>>;

    /**
     * Get a site redirect by its source path.
     */
    getSiteRedirectBySource(params: {
        organizationId: string;
        siteId: string;
        siteShareKey: string | undefined;
        source: string;
    }): Promise<DataFetcherResponse<{ redirect: api.SiteRedirect | null; target: string }>>;

    /**
     * Get an embed by its URL.
     */
    getEmbedByUrl(params: { url: string; spaceId: string }): Promise<
        DataFetcherResponse<api.Embed>
    >;

    /**
     * Search content in a site.
     */
    searchSiteContent(params: {
        organizationId: string;
        siteId: string;
        query: string;
        scope:
            | { mode: 'all' }
            | { mode: 'current'; siteSpaceId: string }
            | { mode: 'specific'; siteSpaceIds: string[] };
        /** Cache bust to ensure the search results are fresh when the space is updated. */
        cacheBust?: string;
    }): Promise<DataFetcherResponse<api.SearchSpaceResult[]>>;

    /**
     * Render an integration UI.
     */
    renderIntegrationUi(params: {
        integrationName: string;
        request: api.RenderIntegrationUI;
    }): Promise<DataFetcherResponse<api.ContentKitRenderOutput>>;
}
