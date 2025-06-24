import type { Revision, RevisionFile, RevisionReusableContent } from '@gitbook/api';
import * as React from 'react';

const getRevisionReusableContents = React.cache((revision: Revision) => {
    return new Map(
        revision.reusableContents.map((reusableContent) => [reusableContent.id, reusableContent])
    );
});

const getRevisionFiles = React.cache((revision: Revision) => {
    return new Map(revision.files.map((file) => [file.id, file]));
});

/**
 * Get a revision file by its ID.
 */
export function getRevisionFile(input: {
    revision: Revision;
    fileId: string;
}): RevisionFile | null {
    const { revision, fileId } = input;
    const files = getRevisionFiles(revision);
    return files.get(fileId) ?? null;
}

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
