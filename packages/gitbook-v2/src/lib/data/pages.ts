import type { JSONDocument, RevisionPageDocument, Space } from '@gitbook/api';
import { getDataOrNull } from './errors';
import type { GitBookDataFetcher } from './types';

/**
 * Get the document for a page.
 */
export async function getPageDocument(
    dataFetcher: GitBookDataFetcher,
    space: Space,
    page: RevisionPageDocument
): Promise<JSONDocument | null> {
    if (page.documentId) {
        return getDataOrNull(
            dataFetcher.getDocument({ spaceId: space.id, documentId: page.documentId })
        );
    }
    if ('computed' in page && page.computed) {
        return getDataOrNull(
            dataFetcher.getComputedDocument({
                organizationId: space.organization,
                spaceId: space.id,
                source: page.computed,
                seed: page.computedSeed,
            })
        );
    }

    return null;
}
