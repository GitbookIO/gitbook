import type { ContentRefTag, Revision, RevisionTag } from '@gitbook/api';

/**
 * Get the tags defined on a revision.
 */
export function getRevisionTags(revision: Revision | undefined): RevisionTag[] {
    // TODO: simplify once new API lands as `tags` will always be defined.
    return revision?.tags ?? [];
}

/**
 * Resolve a tag slug to its full RevisionTag.
 */
export function resolveTag(slug: string, revisionTags: RevisionTag[]): RevisionTag | undefined {
    return revisionTags.find((t) => t.slug === slug);
}

/**
 * Resolve an array of block-level tag references to their full RevisionTags.
 */
export function resolveBlockTags(
    tags: ContentRefTag[] | undefined,
    revisionTags: RevisionTag[]
): RevisionTag[] {
    // TODO: simplify once new API lands as `tags` will always be defined.
    if (!tags || tags.length === 0) {
        return [];
    }
    return tags
        .map((tag) => resolveTag(tag.tag, revisionTags))
        .filter((tag): tag is RevisionTag => tag !== undefined);
}
