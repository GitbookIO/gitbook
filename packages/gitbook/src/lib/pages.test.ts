import { describe, expect, it } from 'bun:test';
import {
    type RevisionPage,
    RevisionPageLayoutOptionsCoverSize,
    RevisionPageLayoutOptionsWidth,
} from '@gitbook/api';

import { resolveFirstDocument, resolvePagePath, resolvePagePathDocumentOrGroup } from './pages';

describe('resolveFirstDocument', () => {
    it('should go into the first group', () => {
        const pages: RevisionPage[] = [
            {
                id: 'p1',
                title: 'Empty group',
                kind: 'group',
                type: 'group',
                path: 'sales',
                slug: 'sales',
                pages: [
                    {
                        id: 'p2',
                        title: 'Product Knowledge',
                        emoji: '1f4da',
                        kind: 'sheet',
                        type: 'document',
                        urls: {
                            app: 'https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/product-knowledge',
                        },
                        path: 'product-knowledge',
                        slug: 'product-knowledge',
                        pages: [],
                        layout: {
                            cover: true,
                            coverSize: RevisionPageLayoutOptionsCoverSize.Full,
                            title: true,
                            description: true,
                            tableOfContents: true,
                            outline: true,
                            pagination: true,
                            width: RevisionPageLayoutOptionsWidth.Default,
                            metadata: true,
                        },
                    },
                ],
            },
        ];

        const page = resolveFirstDocument(pages, []);
        expect(page).toMatchObject({
            page: { id: 'p2' },
            ancestors: [
                {
                    id: 'p1',
                },
            ],
        });
    });

    it('should ignore empty first groups', () => {
        const pages: RevisionPage[] = [
            {
                id: 'p1',
                title: 'Empty group',
                kind: 'group',
                type: 'group',
                path: 'sales',
                slug: 'sales',
                pages: [],
            },
            {
                id: 'p2',
                title: 'Product Knowledge',
                emoji: '1f4da',
                kind: 'sheet',
                type: 'document',
                urls: {
                    app: 'https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/product-knowledge',
                },
                path: 'product-knowledge',
                slug: 'product-knowledge',
                pages: [],
                layout: {
                    cover: true,
                    coverSize: RevisionPageLayoutOptionsCoverSize.Full,
                    title: true,
                    description: true,
                    tableOfContents: true,
                    outline: true,
                    pagination: true,
                    width: RevisionPageLayoutOptionsWidth.Default,
                    metadata: true,
                },
            },
        ];

        const page = resolveFirstDocument(pages, []);
        expect(page).toMatchObject({
            page: { id: 'p2' },
            ancestors: [],
        });
    });
});

describe('resolvePagePath', () => {
    it('should resolve a page path', () => {
        const pages: RevisionPage[] = [
            {
                id: 'p1',
                title: 'Empty group',
                kind: 'sheet',
                type: 'document',
                document: {
                    object: 'document',
                    data: {
                        schemaVersion: 1,
                    },
                    nodes: [],
                },
                urls: {
                    app: 'https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/sales',
                },
                path: 'sales',
                slug: 'sales',
                pages: [],
                layout: {
                    cover: true,
                    coverSize: RevisionPageLayoutOptionsCoverSize.Full,
                    title: true,
                    description: true,
                    tableOfContents: true,
                    outline: true,
                    pagination: true,
                    width: RevisionPageLayoutOptionsWidth.Default,
                    metadata: true,
                },
            },
        ];

        const page = resolvePagePath(pages, 'sales');
        expect(page).toMatchObject({
            page: {
                id: 'p1',
                kind: 'sheet',
                type: 'document',
                document: {
                    object: 'document',
                    data: {
                        schemaVersion: 1,
                    },
                    nodes: [],
                },
                urls: {
                    app: 'https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/sales',
                },
                path: 'sales',
                slug: 'sales',
                pages: [],
                layout: {
                    cover: true,
                    title: true,
                    description: true,
                    tableOfContents: true,
                    outline: true,
                    pagination: true,
                },
            },
        });
    });

    it('should resolve a page path with a group', () => {
        const pages: RevisionPage[] = [
            {
                id: 'p1',
                title: 'Empty group',
                kind: 'group',
                type: 'group',
                path: 'sales',
                slug: 'sales',
                pages: [
                    {
                        id: 'p2',
                        title: 'Product Knowledge',
                        kind: 'sheet',
                        type: 'document',
                        document: {
                            object: 'document',
                            data: {
                                schemaVersion: 1,
                            },
                            nodes: [],
                        },
                        urls: {
                            app: 'https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/product-knowledge',
                        },
                        path: 'product-knowledge',
                        slug: 'product-knowledge',
                        pages: [],
                        layout: {
                            cover: true,
                            coverSize: RevisionPageLayoutOptionsCoverSize.Full,
                            title: true,
                            description: true,
                            tableOfContents: true,
                            outline: true,
                            pagination: true,
                            width: RevisionPageLayoutOptionsWidth.Default,
                            metadata: true,
                        },
                    },
                ],
            },
        ];

        const page = resolvePagePathDocumentOrGroup(pages, 'sales');
        expect(page).toMatchObject({
            ancestors: [],
            page: {
                id: 'p1',
                kind: 'group',
                pages: [
                    {
                        document: {
                            data: {
                                schemaVersion: 1,
                            },
                            nodes: [],
                            object: 'document',
                        },
                        id: 'p2',
                        kind: 'sheet',
                        layout: {
                            cover: true,
                            description: true,
                            outline: true,
                            pagination: true,
                            tableOfContents: true,
                            title: true,
                        },
                        pages: [],
                        path: 'product-knowledge',
                        slug: 'product-knowledge',
                        title: 'Product Knowledge',
                        type: 'document',
                        urls: {
                            app: 'https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/product-knowledge',
                        },
                    },
                ],
                path: 'sales',
                slug: 'sales',
                title: 'Empty group',
                type: 'group',
            },
        });
    });
});
