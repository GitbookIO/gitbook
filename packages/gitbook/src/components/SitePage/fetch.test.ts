import { describe, expect, it, mock } from 'bun:test';

import { CustomizationPageActionType, type RevisionPageDocument } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

mock.module('server-only', () => ({}));

const { fetchPageData, getLowercasePathnameRedirect } = await import('./fetch');
const { normalizeURL } = await import('@/lib/data/urls');

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
        revision: { pages: [page] },
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

describe('fetchPageData', () => {
    it('fetches the Git metadata for an enabled Edit on Git action', async () => {
        const { context, getRevisionPageByPath } = createContext({ gitEnabled: true });

        const result = await fetchPageData(context, { pageId: page.id });

        expect(getRevisionPageByPath).toHaveBeenCalledWith({
            spaceId: 'space-1',
            revisionId: 'revision-1',
            path: 'readme',
            metadata: true,
            cachedMetadata: true,
        });
        expect(result.pageTarget?.page.git).toEqual(git);
        expect(result.context.page?.git).toEqual(git);
    });

    it('does not fetch Git metadata when the action is disabled', async () => {
        const { context, getRevisionPageByPath } = createContext({ gitEnabled: false });

        const result = await fetchPageData(context, { pageId: page.id });

        expect(getRevisionPageByPath).not.toHaveBeenCalled();
        expect(result.pageTarget?.page.git).toBeUndefined();
    });

    it('does not fetch Git metadata without Git Sync', async () => {
        const { context, getRevisionPageByPath } = createContext({
            gitEnabled: true,
            gitSync: false,
        });

        const result = await fetchPageData(context, { pageId: page.id });

        expect(getRevisionPageByPath).not.toHaveBeenCalled();
        expect(result.pageTarget?.page.git).toBeUndefined();
    });
});

describe('getLowercasePathnameRedirect', () => {
    it('redirects ASCII paths with uppercase letters', () => {
        expect(getLowercasePathnameRedirect('Foo/Bar')).toBe('foo/bar');
    });

    it('does not redirect lowercase paths', () => {
        expect(getLowercasePathnameRedirect('foo/cafe')).toBeNull();
    });

    it('does not redirect when only percent-encoded hex digits are uppercase', () => {
        expect(getLowercasePathnameRedirect('foo/caf%C3%A9')).toBeNull();
        expect(getLowercasePathnameRedirect('foo/caf%c3%a9')).toBeNull();
    });

    it('lowercases encoded non-ASCII letters', () => {
        // É -> é
        expect(getLowercasePathnameRedirect('foo/%C3%89')).toBe('foo/%C3%A9');
    });

    it('does not redirect paths that fail to decode', () => {
        expect(getLowercasePathnameRedirect('Foo/%E0%A4%A')).toBeNull();
    });

    it('redirects to a pathname the middleware leaves unchanged', () => {
        const normalize = (pathname: string) =>
            normalizeURL(new URL(`https://example.com/${pathname}`)).pathname.slice(1);

        const paths = [
            'Foo/Bar',
            'Foo/caf%C3%A9',
            'foo/%C3%89',
            'Video/porte%C3%91o-x.html',
            '%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82', // Привет
            '%CE%95%CE%BB%CE%BB%CE%AC%CE%B4%CE%B1', // Ελλάδα
            '%C3%96sterreich/Stra%C3%9FE', // Österreich/StraßE
            '%C4%B0stanbul', // İstanbul, lowercases to two code points
            'Foo:Bar',
            'Foo@Bar+Baz',
            'Brack[et]',
            'Q%3FX',
            'Hash%23Y',
            'Sp%20Ace',
        ];

        for (const path of paths) {
            const target = getLowercasePathnameRedirect(path);
            expect(target).not.toBeNull();
            expect(normalize(target!)).toBe(target!);
            expect(getLowercasePathnameRedirect(target!)).toBeNull();
        }
    });
});
