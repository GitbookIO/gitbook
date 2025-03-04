import type { RevisionPageDocument, Space } from '@gitbook/api';
import type { GitBookDataFetcher } from './types';

/**
 * Get the document for a page.
 */
export async function getPageDocument(
    dataFetcher: GitBookDataFetcher,
    space: Space,
    page: RevisionPageDocument
) {
    if (page.documentId) {
        return dataFetcher.getDocument({ spaceId: space.id, documentId: page.documentId });
    }
    if (page.computed) {
        return dataFetcher.getComputedDocument({
            organizationId: space.organization,
            spaceId: space.id,
            source: page.computed,
        });
    }

    return null;
}
