import { describe, expect, it } from 'bun:test';
import {
    type RevisionPage,
    RevisionPageLayoutOptionsCoverSize,
    RevisionPageLayoutOptionsWidth,
} from '@gitbook/api';

import {
    extractPagePath,
    getSimilarPages,
    resolveFirstDocument,
    resolvePagePath,
    resolvePagePathDocumentOrGroup,
} from './pages';

describe('extractPagePath', () => {
    const baseURL = 'https://docs.example.com/api/';

    it('extracts path from full URL', () => {
        expect(extractPagePath('https://docs.example.com/api/getting-started', baseURL)).toBe(
            'getting-started'
        );
    });

    it('extracts nested path from full URL', () => {
        expect(extractPagePath('https://docs.example.com/api/guides/installation', baseURL)).toBe(
            'guides/installation'
        );
    });

    it('returns undefined when URL does not match base', () => {
        expect(extractPagePath('https://other.com/page', baseURL)).toBeUndefined();
    });

    it('returns empty string for root URL', () => {
        expect(extractPagePath('https://docs.example.com/api/', baseURL)).toBe('');
    });

    it('extracts path when base URL is at the root of the domain', () => {
        expect(
            extractPagePath(
                'https://docs.example.com/merchant-account/user-management/sso',
                'https://docs.example.com/'
            )
        ).toBe('merchant-account/user-management/sso');
    });

    it('returns empty string when URL equals root base URL', () => {
        expect(extractPagePath('https://docs.example.com/', 'https://docs.example.com/')).toBe('');
    });
});

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
                        tags: [],
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
                            tags: true,
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
                tags: [],
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
                    tags: true,
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
                tags: [],
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
                    tags: true,
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
                        tags: [],
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
                            tags: true,
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

describe('getSimilarPages', () => {
    it('returns the closest matches for a typoed path', () => {
        const pages: RevisionPage[] = [
            createDocumentPage('install', 'guides/installation'),
            createDocumentPage('config', 'guides/configuration'),
            createDocumentPage('auth', 'api/authentication'),
        ];

        expect(getSimilarPages(pages, 'guides/installtion', 2).map((page) => page.id)).toEqual([
            'install',
            'config',
        ]);
    });

    it('prefers pages with the same path hierarchy', () => {
        const pages: RevisionPage[] = [
            createDocumentPage('api-auth', 'api/reference/authentication'),
            createDocumentPage('guide-auth', 'guides/authentication'),
            createDocumentPage('api-errors', 'api/reference/errors'),
        ];

        expect(
            getSimilarPages(pages, 'api/reference/authentcation', 1).map((page) => page.id)
        ).toEqual(['api-auth']);
    });

    it('ignores hidden pages', () => {
        const pages: RevisionPage[] = [
            createDocumentPage('hidden', 'private-api', true),
            createDocumentPage('versioned', 'private-api-v2'),
            createDocumentPage('public', 'public-api'),
        ];

        const similar = getSimilarPages(pages, 'privte-api', 2);

        expect(similar.map((page) => page.id)).toEqual(['versioned', 'public']);
        expect(similar.some((page) => page.id === 'hidden')).toBe(false);
    });
});

function createDocumentPage(id: string, path: string, hidden = false): RevisionPage {
    const slug = path.split('/').at(-1) ?? path;

    return {
        id,
        title: path,
        kind: 'sheet',
        type: 'document',
        hidden,
        urls: {
            app: `https://app.gitbook.com/s/fvBF1lEt2CVd4RTffSOk/${path}`,
        },
        path,
        slug,
        pages: [],
        tags: [],
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
            tags: true,
        },
    };
}
