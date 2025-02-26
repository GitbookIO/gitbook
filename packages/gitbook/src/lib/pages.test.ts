import { RevisionPage } from '@gitbook/api';
import { describe, expect, it } from 'bun:test';

import { resolveFirstDocument } from './pages';

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
                            title: true,
                            description: true,
                            tableOfContents: true,
                            outline: true,
                            pagination: true,
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
                    title: true,
                    description: true,
                    tableOfContents: true,
                    outline: true,
                    pagination: true,
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
