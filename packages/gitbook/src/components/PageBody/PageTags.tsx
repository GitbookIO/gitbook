import { getRevisionTags, resolveTag } from '@/lib/tags';
import type { Revision, RevisionPageDocument } from '@gitbook/api';
import { Tag } from '../Tag';

/**
 * Render the tags that were added to a page.
 */
export function PageTags(props: { page: RevisionPageDocument; revision: Revision }) {
    const { page, revision } = props;

    const pageTags = page.tags; // TODO: simplify once new API lands as `tags` will always be defined.
    if (!pageTags || pageTags.length === 0) {
        return null;
    }

    const revisionTags = getRevisionTags(revision);

    return (
        <div className="flex flex-wrap gap-1.5">
            {pageTags.map((tagRef) => {
                const resolved = resolveTag(tagRef.tag.tag, revisionTags);
                if (!resolved) {
                    return null;
                }
                return <Tag key={resolved.slug} label={resolved.label} />;
            })}
        </div>
    );
}
