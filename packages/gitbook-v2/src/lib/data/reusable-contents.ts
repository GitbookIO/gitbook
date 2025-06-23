import type { Revision, RevisionReusableContent } from '@gitbook/api';
import * as React from 'react';

const getRevisionReusableContents = React.cache((revision: Revision) => {
    return new Map(
        revision.reusableContents.map((reusableContent) => [reusableContent.id, reusableContent])
    );
});

/**
 * Get a revision reusable content by its ID.
 */
export function getRevisionReusableContent(input: {
    revision: Revision;
    reusableContentId: string;
}): RevisionReusableContent | null {
    const { revision, reusableContentId } = input;
    const reusableContents = getRevisionReusableContents(revision);
    return reusableContents.get(reusableContentId) ?? null;
}
