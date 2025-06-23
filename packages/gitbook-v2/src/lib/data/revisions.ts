import type { Revision, RevisionFile, RevisionReusableContent, Space } from '@gitbook/api';
import * as React from 'react';
import type { GitBookDataFetcher } from './types';

const getRevisionReusableContents = React.cache((revision: Revision) => {
    return new Map(
        revision.reusableContents.map((reusableContent) => [reusableContent.id, reusableContent])
    );
});

const getRevisionFiles = React.cache((revision: Revision) => {
    return new Map(revision.files.map((file) => [file.id, file]));
});

/**
 * Get a revision for a space.
 */
export function getSpaceRevision(
    dataFetcher: GitBookDataFetcher,
    input: {
        space: Space;
        revisionId: string;
    }
) {
    return dataFetcher.getRevision({
        spaceId: input.space.id,
        revisionId: input.revisionId,
        // We only care about the Git metadata when the Git sync is enabled,
        // otherwise we can optimize performance by not fetching it
        metadata: !!input.space.gitSync,
    });
}

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
