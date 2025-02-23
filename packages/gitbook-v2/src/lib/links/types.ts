import { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

/**
 * Generic interface to generate links based on a given context.
 */
export interface Linker {
    /**
     * Generate an absolute path for a relative path in the current site.
     */
    toPathInSite(relativePath: string): string;

    /**
     * Generate an absolute path for a relative path in the current space content.
     */
    toPathInSpace(relativePath: string): string;

    /**
     * Generate an absolute path for a page in the current space.
     */
    toPathForPage(input: {
        pages: RevisionPage[];
        page: RevisionPageDocument | RevisionPageGroup;
        anchor?: string;
    }): string;

    /**
     * Generate an absolute URL for a given path.
     */
    toAbsoluteURL(absolutePath: string): string;
}
