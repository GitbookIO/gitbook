import { describe, expect, it, mock } from 'bun:test';

import { CustomizationPageActionType, type RevisionPageDocument } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

mock.module('server-only', () => ({}));

const { getPageGitMetadata } = await import('./pageActionsData');

const page = {
    id: 'page-1',
    title: 'Introduction',
    kind: 'sheet',
    type: 'document',
    path: 'readme',
    slug: 'readme',
    pages: [],
} as RevisionPageDocument;

const git = {
    oid: 'abc123',
    path: 'README.md',
};

function createContext(options: { gitEnabled: boolean; gitSync?: boolean }) {
    const getRevisionPageByPath = mock(async () => ({
        data: {
            ...page,
            git,
        },
    }));

    const context = {
        revisionId: 'revision-1',
        customization: {
            pageActions: {
                items: options.gitEnabled ? [CustomizationPageActionType.Git] : [],
            },
        },
        space: {
            id: 'space-1',
            gitSync:
                options.gitSync === false
                    ? undefined
                    : {
                          url: 'https://github.com/gitbook/example/tree/main',
                      },
        },
        dataFetcher: { getRevisionPageByPath },
    } as unknown as GitBookSiteContext;

    return { context, getRevisionPageByPath };
}

describe('getPageGitMetadata', () => {
    it('fetches the Git metadata for an enabled Edit on Git action', async () => {
        const { context, getRevisionPageByPath } = createContext({ gitEnabled: true });

        const result = await getPageGitMetadata(context, page);

        expect(getRevisionPageByPath).toHaveBeenCalledWith({
            spaceId: 'space-1',
            revisionId: 'revision-1',
            path: 'readme',
            metadata: true,
            cachedMetadata: true,
        });
        expect(result).toEqual(git);
    });

    it('does not fetch Git metadata already on the page', async () => {
        const { context, getRevisionPageByPath } = createContext({ gitEnabled: true });

        const result = await getPageGitMetadata(context, { ...page, git });

        expect(getRevisionPageByPath).not.toHaveBeenCalled();
        expect(result).toEqual(git);
    });

    it('does not fetch Git metadata when the action is disabled', async () => {
        const { context, getRevisionPageByPath } = createContext({ gitEnabled: false });

        const result = await getPageGitMetadata(context, page);

        expect(getRevisionPageByPath).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('does not fetch Git metadata without Git Sync', async () => {
        const { context, getRevisionPageByPath } = createContext({
            gitEnabled: true,
            gitSync: false,
        });

        const result = await getPageGitMetadata(context, page);

        expect(getRevisionPageByPath).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });
});
