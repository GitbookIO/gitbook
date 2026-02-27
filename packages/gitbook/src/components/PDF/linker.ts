import type { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { RevisionPageType } from '@gitbook/api';

import type { GitBookLinker } from '@/lib/links';
import { getPagePath } from '@/lib/pages';
import { withTrailingSlash } from '@/lib/paths';

/**
 * Create the HTML ID for the container of a page or a given anchor in it.
 *
 * @param page - The page or page group for which to create the container ID.
 * @param anchor - Optional anchor within the page to include in the container ID.
 * @returns The HTML ID for the container of the page or the given anchor.
 */
export function getPagePDFContainerId(
    page: RevisionPageDocument | RevisionPageGroup,
    anchor?: string
): string {
    return `page-${page.id}${anchor ? `-${anchor}` : ''}`;
}

/**
 * Create a custom linker for PDF exports.
 *
 * This linker generates in-document anchor links for pages that are included
 * in the current PDF export, using `getPagePDFContainerId` to build the
 * target element ID. For pages that are not part of the exported PDF, it
 * falls back to URLs pointing to the published site if `publishedSpaceURL` is
 * provided, preserving navigability for external content. Otherwise, it uses
 * absolute URLs from the base linker.
 *
 * @param baseLinker - The base GitBook linker used to resolve standard paths and URLs.
 * @param pages - The list of pages that are included in the current PDF export.
 * @param publishedSpaceURL - Optional URL of the published space for external page links.
 * @returns A `GitBookLinker` configured to generate PDF-friendly links.
 */
export function createPDFLinker(
    baseLinker: GitBookLinker,
    pages: Array<{ page: Revision['pages'][number] }>,
    publishedSpaceURL?: string
): GitBookLinker {
    return {
        ...baseLinker,
        toPathForPage(input) {
            if (pages.some((p) => p.page.id === input.page.id)) {
                return `#${getPagePDFContainerId(input.page, input.anchor)}`;
            }
            if (input.page.type === RevisionPageType.Group) {
                return '#';
            }

            // For pages that are not embedded in this PDF export, keep links on the published site.
            if (publishedSpaceURL) {
                const pagePath = getPagePath(input.pages, input.page);
                const pageURL = new URL(pagePath, withTrailingSlash(publishedSpaceURL));
                if (input.anchor) {
                    pageURL.hash = input.anchor;
                }

                return pageURL.toString();
            }

            return baseLinker.toAbsoluteURL(baseLinker.toPathForPage(input));
        },
    };
}
