import type { Revision, RevisionFile } from '@gitbook/api';
import * as React from 'react';

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
