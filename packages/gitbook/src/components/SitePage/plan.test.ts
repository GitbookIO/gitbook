import { describe, expect, it, mock } from 'bun:test';

import type { JSONDocument, RevisionPageDocument } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';

mock.module('server-only', () => ({}));

const { runSitePagePlan } = await import('./plan');

const page = { id: 'page-1', type: 'document' } as RevisionPageDocument;

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => {
        resolve = r;
    });
    return { promise, resolve };
}

function setup(options: {
    customization?: Record<string, unknown>;
    embed?: unknown;
    document?: unknown;
    metaLinks?: unknown;
    documentPromise?: Promise<unknown>;
    resolveRefError?: boolean;
}) {
    const dataFetcher = {
        getRevisionPageDocument: mock(
            () => options.documentPromise ?? Promise.resolve({ data: options.document ?? null })
        ),
        listRevisionPageMetaLinks: mock(async () => ({ data: options.metaLinks ?? null })),
        getEmbedByUrl: mock(async () => ({ data: options.embed ?? {} })),
        getRevision: mock(async () => ({ data: {} })),
    };
    const imageResizer = { getImageSize: mock(async () => ({ width: 1, height: 1 })) };
    const context = {
        space: { id: 'space-1' },
        revisionId: 'revision-1',
        customization: {
            styling: { icons: 'regular' },
            header: {},
            footer: {},
            favicon: {},
            ...options.customization,
        },
        structure: {
            type: 'siteSpaces',
            structure: [
                { id: 'ss-1', space: { id: 'space-1', revision: 'revision-1' } },
                { id: 'ss-2', space: { id: 'space-2', revision: 'revision-2' } },
            ],
        },
        dataFetcher,
        imageResizer,
    } as unknown as GitBookSiteContext;

    const resolveRef = mock(
        async (_doc: unknown, ref: { kind: string }, _ctx?: unknown, _opts?: unknown) => {
            if (options.resolveRefError) {
                throw new Error('boom');
            }
            return ref.kind === 'file'
                ? {
                      href: 'https://files/image.png',
                      file: {
                          dimensions: undefined,
                          contentType: 'image/png',
                          downloadURL: 'https://files/download.png',
                      },
                  }
                : { href: '/x' };
        }
    );
    const loadIcons = mock(async () => ({}));
    const loadGitMetadata = mock(async () => undefined);
    return { context, dataFetcher, imageResizer, resolveRef, loadIcons, loadGitMetadata };
}

const doc = (nodes: unknown[]) => ({ object: 'document', nodes }) as unknown as JSONDocument;

describe('runSitePagePlan', () => {
    it('requests the document and the meta links in parallel', async () => {
        const pending = deferred<unknown>();
        const s = setup({ documentPromise: pending.promise });
        const done = runSitePagePlan(s.context, page, s);
        expect(s.dataFetcher.getRevisionPageDocument).toHaveBeenCalledWith({
            spaceId: 'space-1',
            revisionId: 'revision-1',
            pageId: 'page-1',
        });
        expect(s.dataFetcher.listRevisionPageMetaLinks).toHaveBeenCalledWith({
            spaceId: 'space-1',
            revisionId: 'revision-1',
            pageId: 'page-1',
        });
        pending.resolve({ data: null });
        await done;
    });

    it('starts the Git metadata of the page for the Edit on Git action', async () => {
        const s = setup({});
        await runSitePagePlan(s.context, page, s);
        expect(s.loadGitMetadata).toHaveBeenCalledWith(s.context, page);
    });

    it('resolves cross-space links of the layout and the table of contents', async () => {
        const ref = (space: string, page: string) => ({ kind: 'page', space, page });
        const s = setup({
            customization: {
                header: {
                    primaryLink: ref('space-2', 'primary'),
                    links: [
                        {
                            title: 'Docs',
                            to: ref('space-2', 'top'),
                            links: [{ title: 'API', to: ref('space-2', 'nested') }],
                        },
                        { title: 'Here', to: { kind: 'page', page: 'same-space' } },
                    ],
                },
                footer: { groups: [{ title: 'More', links: [{ to: ref('space-2', 'footer') }] }] },
                announcement: {
                    enabled: true,
                    message: 'Hi',
                    link: { to: ref('space-2', 'announce') },
                },
            },
        });
        (s.context as unknown as { revision: unknown }).revision = {
            pages: [
                {
                    type: 'group',
                    pages: [{ type: 'link', target: ref('space-2', 'toc') }],
                },
            ],
        };
        await runSitePagePlan(s.context, page, s);
        const resolved = s.resolveRef.mock.calls.map(([d, r]) => [
            d,
            (r as { page?: string }).page,
        ]);
        for (const name of ['primary', 'top', 'nested', 'footer', 'announce', 'toc']) {
            expect(resolved).toContainEqual([null, name]);
        }
        expect(resolved).not.toContainEqual([null, 'same-space']);
    });

    it('skips hidden table of contents links and a disabled announcement', async () => {
        const ref = (page: string) => ({ kind: 'page', space: 'space-2', page });
        const s = setup({
            customization: {
                announcement: { enabled: false, message: 'Hi', link: { to: ref('announce') } },
            },
        });
        (s.context as unknown as { revision: unknown }).revision = {
            pages: [
                { type: 'link', hidden: true, target: ref('hidden-link') },
                { type: 'group', hidden: true, pages: [{ type: 'link', target: ref('inside') }] },
            ],
        };
        await runSitePagePlan(s.context, page, s);
        expect(s.resolveRef).not.toHaveBeenCalled();
    });

    it('starts embeds from the document with the page space', async () => {
        const s = setup({
            document: doc([
                { object: 'block', type: 'embed', data: { url: 'https://a.example' }, nodes: [] },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        expect(s.dataFetcher.getEmbedByUrl).toHaveBeenCalledWith({
            url: 'https://a.example',
            spaceId: 'space-1',
        });
    });

    it('resolves network refs of nested blocks and inlines, with anchor text for mentions', async () => {
        const link = { kind: 'page', space: 'space-2', page: 'p2' };
        const mention = { kind: 'anchor', page: 'p3', anchor: 'a' };
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                        { object: 'inline', type: 'link', data: { ref: link }, nodes: [] },
                        { object: 'inline', type: 'mention', data: { ref: mention }, nodes: [] },
                    ],
                },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        const calls = s.resolveRef.mock.calls.map(([, ref, , opts]) => [ref, opts]);
        expect(calls).toContainEqual([link, {}]);
        expect(calls).toContainEqual([mention, { resolveAnchorText: true }]);
    });

    it('skips refs that resolve without a request', async () => {
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                        {
                            object: 'inline',
                            type: 'link',
                            data: { ref: { kind: 'page', page: 'p2' } },
                            nodes: [],
                        },
                    ],
                },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        expect(s.resolveRef).not.toHaveBeenCalled();
    });

    it('measures images without known dimensions like the image block does', async () => {
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'images',
                    nodes: [
                        {
                            object: 'block',
                            type: 'image',
                            data: { ref: { kind: 'file', file: 'f1' } },
                            nodes: [],
                        },
                    ],
                },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        expect(s.imageResizer.getImageSize).toHaveBeenCalledWith('https://files/image.png', {
            dpr: 2,
        });
    });

    it('starts the revision of cross-space image files in the site', async () => {
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'image',
                    data: { ref: { kind: 'file', space: 'space-2', file: 'f1' } },
                    nodes: [],
                },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        expect(s.dataFetcher.getRevision).toHaveBeenCalledWith({
            spaceId: 'space-2',
            revisionId: 'revision-2',
        });
    });

    it('measures card covers and resolves cross-space card targets', async () => {
        const target = { kind: 'page', space: 'space-2', page: 'p2' };
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'table',
                    data: {
                        view: {
                            type: 'cards',
                            columns: [],
                            coverDefinition: 'cover',
                            coverDefinitionDark: 'coverDark',
                            targetDefinition: 'target',
                        },
                        definition: {},
                        records: {
                            r1: {
                                orderIndex: 'a',
                                values: {
                                    cover: { kind: 'file', file: 'f1' },
                                    coverDark: { kind: 'file', file: 'f2' },
                                    target,
                                },
                            },
                        },
                    },
                    nodes: [],
                },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        const refs = s.resolveRef.mock.calls.map(([, ref]) => ref);
        expect(refs).toContainEqual({ kind: 'file', file: 'f1' });
        expect(refs).toContainEqual({ kind: 'file', file: 'f2' });
        expect(refs).toContainEqual(target);
        expect(s.imageResizer.getImageSize).toHaveBeenCalledTimes(2);
        expect(s.dataFetcher.getRevision).toHaveBeenCalledWith({
            spaceId: 'space-2',
            revisionId: 'revision-2',
        });
    });

    it('starts the requests of visible table columns only', async () => {
        const anchor = { kind: 'anchor', page: 'p3', anchor: 'a' };
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'table',
                    data: {
                        view: { type: 'grid', columns: ['people', 'link', 'picture'] },
                        definition: {
                            people: { type: 'users' },
                            link: { type: 'content-ref' },
                            picture: { type: 'image' },
                            hidden: { type: 'users' },
                        },
                        records: {
                            r1: {
                                orderIndex: 'a',
                                values: {
                                    people: ['u1'],
                                    link: anchor,
                                    picture: { ref: { kind: 'file', file: 'f1' } },
                                    hidden: ['u2'],
                                },
                            },
                        },
                    },
                    nodes: [],
                },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        const calls = s.resolveRef.mock.calls.map(([, ref, , opts]) => [ref, opts]);
        expect(calls).toContainEqual([{ kind: 'user', user: 'u1' }, {}]);
        expect(calls).toContainEqual([anchor, { resolveAnchorText: true }]);
        expect(calls).toContainEqual([{ kind: 'file', file: 'f1' }, {}]);
        expect(calls).not.toContainEqual([{ kind: 'user', user: 'u2' }, {}]);
        expect(s.imageResizer.getImageSize).toHaveBeenCalledTimes(1);
    });

    it('keeps planning after a malformed table and skips values the render skips', async () => {
        const table = (data: unknown) => ({ object: 'block', type: 'table', data, nodes: [] });
        const s = setup({
            document: doc([
                table({ view: { type: 'grid', columns: ['a'] }, records: { r1: {} } }),
                table({
                    view: {
                        type: 'cards',
                        columns: ['img', 'people'],
                        coverDefinitionDark: 'dark',
                    },
                    definition: { img: { type: 'image' }, people: { type: 'users' } },
                    records: {
                        r1: {
                            orderIndex: 'a',
                            values: {
                                img: { ref: undefined },
                                people: ['u1', 2],
                                dark: { kind: 'file', file: 'f2' },
                            },
                        },
                    },
                }),
                { object: 'block', type: 'embed', data: { url: 'https://after' }, nodes: [] },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        expect(s.dataFetcher.getEmbedByUrl).toHaveBeenCalledWith({
            url: 'https://after',
            spaceId: 'space-1',
        });
        expect(s.resolveRef).not.toHaveBeenCalled();
        expect(s.imageResizer.getImageSize).not.toHaveBeenCalled();
    });

    it('measures the site logos, and the custom icon only without a header logo', async () => {
        const withLogo = setup({
            customization: {
                header: { logo: { light: 'https://l/h.png', dark: 'https://l/hd.png' } },
                footer: { logo: { light: 'https://l/f.png' } },
                favicon: { icon: { light: 'https://l/i.png', dark: 'https://l/id.png' } },
            },
        });
        await runSitePagePlan(withLogo.context, page, withLogo);
        const measured = withLogo.imageResizer.getImageSize.mock.calls as unknown[][];
        expect(measured).toContainEqual(['https://l/h.png', { dpr: 2 }]);
        expect(measured).toContainEqual(['https://l/hd.png', { dpr: 2 }]);
        expect(measured).toContainEqual(['https://l/f.png', { dpr: 2 }]);
        expect(measured).not.toContainEqual(['https://l/i.png', { dpr: 2 }]);

        const iconOnly = setup({
            customization: {
                favicon: { icon: { light: 'https://l/i.png', dark: 'https://l/id.png' } },
            },
        });
        await runSitePagePlan(iconOnly.context, page, iconOnly);
        const iconCalls = iconOnly.imageResizer.getImageSize.mock.calls as unknown[][];
        expect(iconCalls).toContainEqual(['https://l/i.png', { dpr: 2 }]);
        expect(iconCalls).toContainEqual(['https://l/id.png', { dpr: 2 }]);
    });

    it('measures the page cover like PageCover, only when the layout shows it', async () => {
        const cover = { ref: { kind: 'file', file: 'c1' }, refDark: { kind: 'file', file: 'c2' } };
        const s = setup({});
        await runSitePagePlan(
            s.context,
            {
                ...page,
                cover,
                layout: { cover: true, coverSize: 'hero' },
            } as unknown as RevisionPageDocument,
            s
        );
        const refs = s.resolveRef.mock.calls.map(([d, ref]) => [d, ref]);
        expect(refs).toContainEqual([null, cover.ref]);
        expect(refs).toContainEqual([null, cover.refDark]);
        expect(s.imageResizer.getImageSize).toHaveBeenCalledWith('https://files/image.png', {});

        const hidden = setup({});
        await runSitePagePlan(
            hidden.context,
            {
                ...page,
                cover,
                layout: { cover: false, coverSize: 'hero' },
            } as unknown as RevisionPageDocument,
            hidden
        );
        expect(hidden.imageResizer.getImageSize).not.toHaveBeenCalled();
    });

    it('measures inline images, drawings and image files like their blocks', async () => {
        const s = setup({
            document: doc([
                {
                    object: 'block',
                    type: 'paragraph',
                    nodes: [
                        {
                            object: 'inline',
                            type: 'inline-image',
                            data: { ref: { kind: 'file', file: 'i1' }, size: 'line' },
                            nodes: [],
                        },
                    ],
                },
                {
                    object: 'block',
                    type: 'drawing',
                    data: { ref: { kind: 'file', file: 'd1' } },
                    nodes: [],
                },
                { object: 'block', type: 'file', data: { ref: { kind: 'file', file: 'f1' } } },
            ]),
        });
        await runSitePagePlan(s.context, page, s);
        const measured = s.imageResizer.getImageSize.mock.calls as unknown[][];
        expect(measured).toContainEqual(['https://files/image.png', { dpr: 2 }]);
        expect(measured).toContainEqual(['https://files/image.png', { dpr: 3 }]);
        expect(measured).toContainEqual(['https://files/download.png', { dpr: 2 }]);
    });

    it('measures the icon of link embeds once the embed arrives', async () => {
        const s = setup({
            embed: { type: 'link', icon: 'https://site/icon.png' },
            document: doc([{ object: 'block', type: 'embed', data: { url: 'u' }, nodes: [] }]),
        });
        await runSitePagePlan(s.context, page, s);
        expect(s.imageResizer.getImageSize).toHaveBeenCalledWith('https://site/icon.png', {
            dpr: 2,
        });

        const rich = setup({
            embed: { type: 'rich', icon: 'https://site/icon.png' },
            document: doc([{ object: 'block', type: 'embed', data: { url: 'u' }, nodes: [] }]),
        });
        await runSitePagePlan(rich.context, page, rich);
        expect(rich.imageResizer.getImageSize).not.toHaveBeenCalled();
    });

    it('starts the revision of meta-link alternates in the site alongside their space', async () => {
        const alternate = { kind: 'page', space: 'space-2', page: 'p9' };
        const s = setup({ metaLinks: { canonical: null, alternates: [alternate] } });
        await runSitePagePlan(s.context, page, s);
        expect(s.dataFetcher.getRevision).toHaveBeenCalledWith({
            spaceId: 'space-2',
            revisionId: 'revision-2',
        });
        expect(s.resolveRef.mock.calls.map(([, ref]) => ref)).toContainEqual(alternate);
    });

    it('settles without unhandled rejections when every branch fails', async () => {
        const unhandled: unknown[] = [];
        const onUnhandled = (reason: unknown) => unhandled.push(reason);
        process.on('unhandledRejection', onUnhandled);
        try {
            const s = setup({
                resolveRefError: true,
                metaLinks: { alternates: [{ kind: 'page', space: 'space-2', page: 'p' }] },
                document: doc([
                    { object: 'block', type: 'embed', data: { url: 'u' }, nodes: [] },
                    {
                        object: 'block',
                        type: 'paragraph',
                        nodes: [{ object: 'inline', type: 'link', data: { ref: { kind: 'url' } } }],
                    },
                ]),
            });
            s.dataFetcher.getEmbedByUrl.mockImplementation(async () => {
                throw new Error('embed');
            });
            s.loadIcons.mockImplementation(async () => {
                throw new Error('icons');
            });
            await runSitePagePlan(s.context, page, s);
            await new Promise((r) => setTimeout(r, 10));
            expect(unhandled).toEqual([]);
        } finally {
            process.off('unhandledRejection', onUnhandled);
        }
    });
});
