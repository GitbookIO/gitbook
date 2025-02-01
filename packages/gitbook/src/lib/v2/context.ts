import { Collection, GitBookAPI, PublishedContentSite, RevisionFile, RevisionReusableContent, Space, User } from "@gitbook/api";

/**
 * Global context for rendering GitBook.
 * The context is designed to help migrate from v1 to v2, with components implemented for both versions.
 */
export interface GitBookContext {
    /**
     * API client to fetch data from GitBook.
     */
    api: GitBookAPI;

    /**
     * Resolve a url/pathname to a link.
     */
    getLink(pathname: string): string;

    /**
     * Get a published site by ID.
     */
    getPublishedContentSite(organizationId: string, siteId: string): Promise<PublishedContentSite>;

    /**
     * Get a file from a revision.
     */
    getRevisionFile(spaceId: string, revisionId: string, file: string): Promise<RevisionFile>;

    /**
     * Get a user by ID.
     */
    getUserById(userId: string): Promise<User>;

    /**
     * Get a space by ID.
     */
    getSpaceById(spaceId: string, shareKey: string | undefined): Promise<Space>;

    /**
     * Get a collection by ID.
     */
    getCollection(collectionId: string): Promise<Collection>;

    /**
     * Get a reusable content by ID.
     */
    getReusableContent(spaceId: string, revisionId: string, reusableContentId: string): Promise<RevisionReusableContent>;
}
