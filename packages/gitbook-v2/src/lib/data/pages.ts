import type { SlimJSONDocument } from '@/lib/slim-document';
import type { RevisionPageDocument, Space } from '@gitbook/api';
import { getDataOrNull } from './errors';
import type { GitBookDataFetcher } from './types';

/**
 * Get the document for a page.
 */
export async function getPageDocument(
    dataFetcher: GitBookDataFetcher,
    space: Space,
    page: RevisionPageDocument
): Promise<SlimJSONDocument | null> {
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
