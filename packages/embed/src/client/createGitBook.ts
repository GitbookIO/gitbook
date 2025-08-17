export type CreateGitBookOptions = {
    /**
     * URL of the GitBook site to embed.
     */
    siteURL: string;
};

export type GitBookClient = {};

export function createGitBook(options: CreateGitBookOptions) {
    const client: GitBookClient = {};

    return client;
}
