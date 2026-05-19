import type { JSONDocument, Revision, RevisionTag } from '@gitbook/api';
import { getBlocksByType } from './document';
import { getRevisionTags, resolveBlockTags } from './tags';

/**
 * Get the unique tags used by update entries in a document, preserving document order.
 */
export function getDocumentUpdateTags(
    document: JSONDocument,
    revision: Revision | undefined
): RevisionTag[] {
    const revisionTags = getRevisionTags(revision);
    const seen = new Set<string>();
    const tags: RevisionTag[] = [];

    for (const updatesBlock of getBlocksByType(document, 'updates')) {
        for (const updateBlock of updatesBlock.nodes) {
            for (const tag of resolveBlockTags(updateBlock.data.tags, revisionTags)) {
                if (seen.has(tag.slug)) {
                    continue;
                }

                tags.push(tag);
                seen.add(tag.slug);
            }
        }
    }

    return tags;
}
