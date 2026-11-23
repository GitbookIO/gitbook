import { describe, expect, it, mock } from 'bun:test';

import type { RevisionPageDocument } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

mock.module('server-only', () => ({}));

const {
    getLowercasePathnameRedirect,
    startSitePagePlan,
    resolveMissingPagePath,
    resolveSitePageFromURL,
} = await import('./fetch');
const { normalizeURL } = await import('@/lib/data/urls');
const { createLinker } = await import('@/lib/links');

const page = {
    id: 'page-1',
    title: 'Introduction',
    kind: 'sheet',
    type: 'document',
    path: 'readme',
    slug: 'readme',
    pages: [],
} as RevisionPageDocument;

describe('resolveMissingPagePath', () => {
    function createRedirectContext(options: {
        siteRedirect?: { source?: string; target: string; permanent?: boolean };
        spaceRedirectPageId?: string;
    }) {
        const getSiteRedirectBySource = mock(async ({ source }: { source: string }) =>
            options.siteRedirect && source === (options.siteRedirect.source ?? '/old')
                ? {
                      data: {
                          target: options.siteRedirect.target,
                          redirect: { permanent: options.siteRedirect.permanent ?? false },
                      },
                  }
                : { error: { code: 404, message: 'Not found' } }
        );
        const getRevisionPageByPath = mock(async () =>
            options.spaceRedirectPageId
                ? { data: { id: options.spaceRedirectPageId } }
                : { error: { code: 404, message: 'Not found' } }
        );

        return {
            organizationId: 'org-1',
            site: { id: 'site-1' },
            space: { id: 'space-1', revision: 'revision-1' },
            revisionId: 'revision-1',
            revision: { pages: [page] },
            linker: {
                toPathInSpace: (path: string) => path,
                toRelativePathInSite: (path: string) => path,
                toLinkForContent: (url: string) => new URL(url).pathname,
            },
            dataFetcher: { getSiteRedirectBySource, getRevisionPageByPath },
        } as unknown as GitBookSiteContext;
    }

    it('resolves a site redirect', async () => {
        const context = createRedirectContext({
            siteRedirect: { target: 'https://docs.example.com/new', permanent: true },
        });

        expect(await resolveMissingPagePath(context, 'old')).toEqual({
            type: 'redirect',
            destination: '/new',
            permanent: true,
        });
    });

    it('resolves a site redirect whose source has non-ASCII characters', async () => {
        const context = createRedirectContext({
            siteRedirect: {
                source: '/de/kategorien-hinzuf%C3%BCgen',
                target: 'https://docs.example.com/new',
            },
        });
        const pathname = normalizeURL(
            new URL('https://docs.example.com/de/kategorien-hinzufügen')
        ).pathname.slice(1);

        expect(await resolveMissingPagePath(context, pathname)).toEqual({
            type: 'redirect',
            destination: '/new',
            permanent: false,
        });
    });

    it('resolves a space redirect to a page', async () => {
        const context = createRedirectContext({ spaceRedirectPageId: page.id });

        expect(await resolveMissingPagePath(context, 'old')).toEqual({
            type: 'page',
            page: { page, ancestors: [] },
        });
    });

    it('returns undefined when nothing matches', async () => {
        const context = createRedirectContext({});

        expect(await resolveMissingPagePath(context, 'old')).toBeUndefined();
    });
});

describe('resolveSitePageFromURL', () => {
    const newPage = { ...page, id: 'page-2', title: 'New', path: 'new', slug: 'new' };
    const siteSpace = {
        id: 'site-space-1',
        default: true,
        space: { id: 'space-1', revision: 'revision-1' },
        urls: { published: 'https://docs.example.com/' },
    };

    function createURLContext(siteRedirectTarget: string) {
        return {
            organizationId: 'org-1',
            site: { id: 'site-1' },
            structure: { type: 'siteSpaces', structure: [siteSpace] },
            siteSpaces: [siteSpace],
            linker: createLinker({
                host: 'docs.example.com',
                siteBasePath: '/',
                spaceBasePath: '/',
            }),
            dataFetcher: {
                getSpace: async () => ({
                    data: { id: 'space-1', revision: 'revision-1', organization: 'org-1' },
                }),
                getRevision: async () => ({ data: { pages: [page, newPage] } }),
                getSiteRedirectBySource: async ({ source }: { source: string }) =>
                    source === '/old'
                        ? { data: { target: siteRedirectTarget, redirect: null } }
                        : { error: { code: 404, message: 'Not found' } },
                getRevisionPageByPath: async () => ({
                    error: { code: 404, message: 'Not found' },
                }),
            },
        } as unknown as GitBookSiteContext;
    }

    it('follows a site redirect to the target page', async () => {
        const context = createURLContext('https://docs.example.com/new');

        const resolved = await resolveSitePageFromURL(context, 'https://docs.example.com/old');
        expect(resolved?.page.id).toBe('page-2');
    });

    it('does not follow a site redirect outside the site', async () => {
        const context = createURLContext('https://elsewhere.example.com/new');

        expect(await resolveSitePageFromURL(context, 'https://docs.example.com/old')).toBeNull();
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

describe('startSitePagePlan', () => {
    function createContext(getRevisionPageDocument: (params: unknown) => Promise<unknown>) {
        return {
            space: { id: 'space-1' },
            revisionId: 'revision-1',
            revision: { pages: [page] },
            siteSpace: { id: 'site-space-1', pageId: null },
            dataFetcher: { getRevisionPageDocument: mock(getRevisionPageDocument) },
        } as unknown as GitBookSiteContext;
    }

    it('requests the document of the page at the lowercased path', () => {
        const context = createContext(async () => ({ data: {} }));
        startSitePagePlan(context, { pathname: 'ReadMe' });
        expect(context.dataFetcher.getRevisionPageDocument).toHaveBeenCalledWith({
            spaceId: 'space-1',
            revisionId: 'revision-1',
            pageId: 'page-1',
        });
    });

    it('does nothing when the path does not resolve to a page', () => {
        const context = createContext(async () => ({ data: {} }));
        startSitePagePlan(context, { pathname: 'missing' });
        expect(context.dataFetcher.getRevisionPageDocument).not.toHaveBeenCalled();
    });

    it('does not leak a rejection when the request fails', async () => {
        const unhandled: unknown[] = [];
        const onUnhandled = (reason: unknown) => unhandled.push(reason);
        process.on('unhandledRejection', onUnhandled);
        try {
            const context = createContext(async () => ({ error: { code: 500, message: 'boom' } }));
            startSitePagePlan(context, { pathname: 'readme' });
            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(unhandled).toEqual([]);
        } finally {
            process.off('unhandledRejection', onUnhandled);
        }
    });
});
