import { describe, expect, it, mock } from 'bun:test';

import type { RevisionPageDocument, SiteRedirectDestination } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

mock.module('server-only', () => ({}));

const { getLowercasePathnameRedirect, resolveMissingPagePath, resolveSitePageFromURL } =
    await import('./fetch');
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
        siteRedirect?: {
            source?: string;
            target: string;
            permanent?: boolean;
            destination?: SiteRedirectDestination;
        };
        spaceRedirectPageId?: string;
        contextId?: string;
        structure?: GitBookSiteContext['structure'];
        revisionsBySpace?: Record<string, RevisionPageDocument[]>;
    }) {
        const getSiteRedirectBySource = mock(async ({ source }: { source: string }) =>
            options.siteRedirect && source === (options.siteRedirect.source ?? '/old')
                ? {
                      data: {
                          target: options.siteRedirect.target,
                          redirect: {
                              permanent: options.siteRedirect.permanent ?? false,
                              ...(options.siteRedirect.destination
                                  ? { destination: options.siteRedirect.destination }
                                  : {}),
                          },
                      },
                  }
                : { error: { code: 404, message: 'Not found' } }
        );
        const getRevisionPageByPath = mock(async () =>
            options.spaceRedirectPageId
                ? { data: { id: options.spaceRedirectPageId } }
                : { error: { code: 404, message: 'Not found' } }
        );
        const getRevision = mock(async ({ spaceId }: { spaceId: string }) =>
            options.revisionsBySpace?.[spaceId]
                ? { data: { pages: options.revisionsBySpace[spaceId] } }
                : { error: { code: 404, message: 'Not found' } }
        );

        const defaultSiteSpace = {
            id: 'site-space-1',
            space: { id: 'space-1', revision: 'revision-1' },
        };

        return {
            organizationId: 'org-1',
            site: { id: 'site-1' },
            siteSpace: defaultSiteSpace,
            structure: options.structure ?? {
                type: 'siteSpaces',
                structure: [defaultSiteSpace],
            },
            space: { id: 'space-1', revision: 'revision-1' },
            revisionId: 'revision-1',
            revision: { pages: [page] },
            contextId: options.contextId,
            linker: {
                toPathInSpace: (path: string) => path,
                toRelativePathInSite: (path: string) => path,
                toLinkForContent: (url: string) => new URL(url).pathname,
            },
            dataFetcher: { getSiteRedirectBySource, getRevisionPageByPath, getRevision },
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

    it('ignores a site redirect that targets the current path', async () => {
        const context = createRedirectContext({
            siteRedirect: {
                source: '/release-notes/restricted',
                target: 'https://docs.example.com/release-notes/restricted',
            },
        });

        expect(await resolveMissingPagePath(context, 'release-notes/restricted')).toBeUndefined();
    });

    it('ignores a site redirect that targets the current path with trailing slash, case, or query differences', async () => {
        const context = createRedirectContext({
            siteRedirect: {
                source: '/release-notes/restricted',
                target: 'https://docs.example.com/Release-Notes/Restricted/?tab=1#top',
            },
        });

        expect(await resolveMissingPagePath(context, 'release-notes/restricted')).toBeUndefined();
    });

    it('ignores a space-relative redirect that resolves back to the current section path', async () => {
        const context = {
            ...createRedirectContext({
                siteRedirect: {
                    source: '/v3/getting-started',
                    target: 'https://docs.example.com/docs/v3/getting-started',
                },
            }),
            linker: createLinker({
                host: 'docs.example.com',
                siteBasePath: '/',
                spaceBasePath: '/docs/',
            }),
        } as unknown as GitBookSiteContext;

        expect(await resolveMissingPagePath(context, 'v3/getting-started')).toBeUndefined();
    });

    it('ignores a site redirect targeting a hidden site space on an adaptive site', async () => {
        const context = createRedirectContext({
            contextId: 'adaptive-ctx',
            siteRedirect: {
                source: '/getting-started',
                target: 'https://docs.example.com/docs/v3/getting-started',
                destination: {
                    kind: 'site-page',
                    siteSpaceId: 'site-space-hidden',
                    pageId: 'page-v3',
                },
            },
        });

        expect(await resolveMissingPagePath(context, 'getting-started')).toBeUndefined();
    });

    it('ignores a site redirect targeting a hidden section on an adaptive site', async () => {
        const context = createRedirectContext({
            contextId: 'adaptive-ctx',
            structure: {
                type: 'sections',
                structure: [
                    {
                        object: 'site-section',
                        id: 'section-visible',
                        siteSpaces: [
                            {
                                id: 'site-space-1',
                                space: { id: 'space-1', revision: 'revision-1' },
                            },
                        ],
                    },
                ],
            } as unknown as GitBookSiteContext['structure'],
            siteRedirect: {
                source: '/old-section',
                target: 'https://docs.example.com/hidden-section',
                destination: {
                    kind: 'site-section',
                    siteSectionId: 'section-hidden',
                },
            },
        });

        expect(await resolveMissingPagePath(context, 'old-section')).toBeUndefined();
    });

    it('ignores a site redirect targeting a hidden page in the current space on an adaptive site', async () => {
        const context = createRedirectContext({
            contextId: 'adaptive-ctx',
            siteRedirect: {
                source: '/release-notes/restricted.html',
                target: 'https://docs.example.com/release-notes/restricted',
                destination: {
                    kind: 'site-page',
                    siteSpaceId: 'site-space-1',
                    pageId: 'hidden-page',
                },
            },
        });

        expect(
            await resolveMissingPagePath(context, 'release-notes/restricted.html')
        ).toBeUndefined();
    });

    it('checks target page visibility in another accessible space on an adaptive site', async () => {
        const otherSpace = {
            id: 'site-space-2',
            space: { id: 'space-2', revision: 'revision-2' },
        };
        const structure = {
            type: 'siteSpaces',
            structure: [
                { id: 'site-space-1', space: { id: 'space-1', revision: 'revision-1' } },
                otherSpace,
            ],
        } as unknown as GitBookSiteContext['structure'];

        const hiddenContext = createRedirectContext({
            contextId: 'adaptive-ctx',
            structure,
            revisionsBySpace: { 'space-2': [] },
            siteRedirect: {
                source: '/old',
                target: 'https://docs.example.com/other/secret',
                destination: {
                    kind: 'site-page',
                    siteSpaceId: 'site-space-2',
                    pageId: 'page-secret',
                },
            },
        });
        expect(await resolveMissingPagePath(hiddenContext, 'old')).toBeUndefined();

        const visibleContext = createRedirectContext({
            contextId: 'adaptive-ctx',
            structure,
            revisionsBySpace: { 'space-2': [{ ...page, id: 'page-secret', path: 'secret' }] },
            siteRedirect: {
                source: '/old',
                target: 'https://docs.example.com/other/secret',
                destination: {
                    kind: 'site-page',
                    siteSpaceId: 'site-space-2',
                    pageId: 'page-secret',
                },
            },
        });
        expect(await resolveMissingPagePath(visibleContext, 'old')).toEqual({
            type: 'redirect',
            destination: '/other/secret',
            permanent: false,
        });
    });

    it('ignores a site redirect targeting the reassigned default variant path of the current space', async () => {
        const context = {
            ...createRedirectContext({
                contextId: 'adaptive-ctx',
                siteRedirect: {
                    source: '/guide/missing',
                    target: 'https://docs.example.com/guide/v3/missing',
                    destination: {
                        kind: 'site-space',
                        siteSpaceId: 'site-space-v3',
                    },
                },
                structure: {
                    type: 'sections',
                    structure: [
                        {
                            object: 'site-section',
                            id: 'section-guide',
                            siteSpaces: [
                                {
                                    id: 'site-space-v3',
                                    path: 'v3',
                                    default: true,
                                    space: { id: 'space-v3', revision: 'revision-1' },
                                },
                            ],
                        },
                    ],
                } as unknown as GitBookSiteContext['structure'],
            }),
            siteSpace: {
                id: 'site-space-v3',
                path: 'v3',
                default: true,
                space: { id: 'space-v3', revision: 'revision-1' },
            },
            linker: createLinker({
                host: 'docs.example.com',
                siteBasePath: '/',
                spaceBasePath: '/guide/',
            }),
        } as unknown as GitBookSiteContext;

        expect(await resolveMissingPagePath(context, 'missing')).toBeUndefined();
    });

    it('keeps a redirect whose current path contains a literal question mark', async () => {
        const context = createRedirectContext({
            siteRedirect: {
                source: '/foo/bar%3Fbaz',
                target: 'https://docs.example.com/foo/bar',
            },
        });

        expect(await resolveMissingPagePath(context, 'foo/bar?baz')).toEqual({
            type: 'redirect',
            destination: '/foo/bar',
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

    it('resolves a page ID path to the page, keeping the ID case', async () => {
        const context = createRedirectContext({});
        const idPage = { ...page, id: 'wwCLFQyPl9cctUGxdLZm' };
        context.revision.pages = [page, idPage];

        expect(await resolveMissingPagePath(context, 'pages/wwCLFQyPl9cctUGxdLZm')).toEqual({
            type: 'page',
            page: { page: idPage, ancestors: [] },
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
