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

    return getDataOrNull(
        dataFetcher.getRevisionPageDocument({
            spaceId: space.id,
            revisionId: context.revisionId,
            pageId: page.id,
        })
    );
}
