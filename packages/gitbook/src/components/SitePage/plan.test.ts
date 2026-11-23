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
        getEmbedByUrl: mock(async () => ({ data: {} })),
        getRevision: mock(async () => ({ data: {} })),
    };
    const imageResizer = { getImageSize: mock(async () => ({ width: 1, height: 1 })) };
    const context = {
        space: { id: 'space-1' },
        revisionId: 'revision-1',
        customization: { styling: { icons: 'regular' } },
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
                ? { href: 'https://files/image.png', file: { dimensions: undefined } }
                : { href: '/x' };
        }
    );
    const loadIcons = mock(async () => ({}));
    return { context, dataFetcher, imageResizer, resolveRef, loadIcons };
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
