import type { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';
import { RevisionPageType } from '@gitbook/api';

import type { GitBookLinker } from '@/lib/links';

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
 * Pages rendered in the current batch get in-document anchors. Other pages link to the
 * published site when possible; pages exported in another batch otherwise link to that batch.
 */
export function createPDFLinker(
    baseLinker: GitBookLinker,
    pages: { page: Revision['pages'][number] }[],
    publishedLinker?: GitBookLinker,
    options: {
        /** URL of the export batch rendering a page, for pages outside the current batch. */
        getBatchURL?: (page: RevisionPageDocument | RevisionPageGroup) => string | undefined;
    } = {}
): GitBookLinker {
    const pageIds = new Set(pages.map((p) => p.page.id));

    return {
        ...baseLinker,
        toPathForPage(input) {
            if (pageIds.has(input.page.id)) {
                return `#${getPagePDFContainerId(input.page, input.anchor)}`;
            }

            // A published page outlives the export URL, so prefer it for documents.
            if (input.page.type !== RevisionPageType.Group && publishedLinker) {
                return publishedLinker.toPathForPage(input);
            }

            const batchURL = options.getBatchURL?.(input.page);
            if (batchURL) {
                return `${batchURL}#${getPagePDFContainerId(input.page, input.anchor)}`;
            }

            if (input.page.type === RevisionPageType.Group) {
                return '#';
            }

            return baseLinker.toAbsoluteURL(baseLinker.toPathForPage(input));
        },
    };
}
