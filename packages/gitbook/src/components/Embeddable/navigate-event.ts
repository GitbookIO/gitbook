import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import type { GitBookNavigateEvent } from '@gitbook/embed';

import type { GitBookLinker } from '@/lib/links';
import { withLeadingSlash } from '@/lib/paths';

type PageInput = {
    /** The embed's linker. */
    linker: GitBookLinker;
    pages: RevisionPage[];
    page: RevisionPageDocument | RevisionPageGroup;
};

/**
 * Path of a page on the published site, outside the embed.
 */
export function getEmbeddablePagePublishedPath({ linker, pages, page }: PageInput): string {
    return linker.toPathForPage({ pages, page }).replace(/~gitbook\/embed\/page\/?/, '');
}

function trimTrailingSlash(pathname: string): string {
    return pathname.replace(/(.)\/$/, '$1');
}

/**
 * Describe a docs page for the `navigate` event sent to the host of the embed.
 */
export function getEmbeddableDocsNavigateEvent(
    input: PageInput
): Extract<GitBookNavigateEvent, { tab: 'docs' }> {
    const { linker, page } = input;
    // Query parameters can carry the visitor's token; the host only gets the page.
    const { pathname } = new URL(getEmbeddablePagePublishedPath(input), 'https://gitbook.local');
    // Relative before trimming: the site base path ends with a slash, so `/docs` wouldn't match it.
    const path = trimTrailingSlash(withLeadingSlash(linker.toRelativePathInSite(pathname)));
    const url = linker.toAbsoluteURL(trimTrailingSlash(pathname));

    return {
        tab: 'docs',
        path,
        // Joining paths drops the slash of a root URL (`https://example.com`).
        url: URL.canParse(url) ? new URL(url).href : url,
        title: page.title,
    };
}
