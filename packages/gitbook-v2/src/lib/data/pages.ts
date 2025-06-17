import { isV2 } from '@/lib/v2';
import type { JSONDocument, RevisionPageDocument } from '@gitbook/api';
import type { GitBookSiteContext, GitBookSpaceContext } from '../context';
import { getDataOrNull } from './errors';

/**
 * Get the document for a page.
 */
export async function getPageDocument(
    context: GitBookSpaceContext | GitBookSiteContext,
    page: RevisionPageDocument
): Promise<JSONDocument | null> {
    const { dataFetcher, space } = context;

    if (isV2()) {
        return getDataOrNull(
            dataFetcher.getRevisionPageDocument({
                spaceId: space.id,
                revisionId: space.revision,
                pageId: page.id,
            })
        );
    }

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
