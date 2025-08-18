import { type GitBookFrameClient, createGitBookFrame } from './createGitBookFrame';

export type CreateGitBookOptions = {
    /**
     * URL of the GitBook site to embed.
     */
    siteURL: string;
};

export type GetFrameURLOptions = {
    /**
     * Authentication to use for the frame.
     */
    visitor?: {
        /**
         * Signed JWT token for Adaptive Content or Visitor Authentication to use.
         */
        token?: string;

        /**
         * Unsigned claims to pass to the frame.
         * You can use these claims in dynamic expressions using `visitor.claims.unsigned.<claim-name>`.
         */
        unsignedClaims?: Record<string, unknown>;
    };
};

export type GitBookClient = {
    /**
     * Get the URL for a GitBook frame.
     */
    getFrameURL: (options: GetFrameURLOptions) => string;
    /**
     * Create a new GitBook frame.
     */
    createFrame: (iframe: HTMLIFrameElement) => GitBookFrameClient;
};

export function createGitBook(options: CreateGitBookOptions) {
    const client: GitBookClient = {
        getFrameURL: (frameOptions) => {
            const url = new URL(options.siteURL);
            url.pathname = `${url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`}~gitbook/embed/assistant`;

            if (frameOptions.visitor?.token) {
                url.searchParams.set('token', frameOptions.visitor.token);
            }

            if (frameOptions.visitor?.unsignedClaims) {
                Object.entries(frameOptions.visitor.unsignedClaims).forEach(([key, value]) => {
                    url.searchParams.set(`visitor.${key}`, String(value));
                });
            }

            return url.toString();
        },
        createFrame: (iframe) => createGitBookFrame(iframe),
    };

    return client;
}
