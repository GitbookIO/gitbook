import { waitUntil } from '@/lib/waitUntil';
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

    if (
        'site' in context &&
        (context.site.id === 'site_JOVzv' || context.site.id === 'site_IxAYj')
    ) {
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

    // Pre-fetch the document to start filling the cache before we migrate to this API.
    if (isInPercentRollout(space.id, 10)) {
        await waitUntil(
            getDataOrNull(
                dataFetcher.getRevisionPageDocument({
                    spaceId: space.id,
                    revisionId: space.revision,
                    pageId: page.id,
                })
            )
        );
    }

    return null;
}

function isInPercentRollout(value: string, rollout: number) {
    return getRandomPercent(value) < rollout;
}

function getRandomPercent(value: string) {
    const hash = value.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
    }, 0);

    return hash % 100;
}
