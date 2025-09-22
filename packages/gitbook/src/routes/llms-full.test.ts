import { describe, expect, it, mock } from 'bun:test';
import type { GitBookSiteContext } from '@/lib/context';
import type { SiteSpace } from '@gitbook/api';

import { streamMarkdownFromSiteSpaces } from './llms-full';

function createMockLinker(args?: { spaceBasePath?: string }) {
    return {
        toAbsoluteURL: mock((path: string) => `https://example.com${path}`),
        toPathInSite: mock((path: string) => `/site/${args?.spaceBasePath ?? ''}${path}`),
        fork: (args: { spaceBasePath: string }) => createMockLinker(args),
    };
}

describe('streamMarkdownFromSiteSpaces', () => {
    // Test with real mocks of the dependencies
    it('processes pages correctly with pagination', async () => {
        // Mock the dependencies by replacing them in the module
        const mockDataFetcher = {
            getRevision: mock(() =>
                Promise.resolve({
                    data: {
                        id: 'revision-1',
                        pages: [
                            {
                                id: 'page-1',
                                type: 'document',
                                title: 'Page 1',
                                path: 'page-1',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'page-2',
                                type: 'document',
                                title: 'Page 2',
                                path: 'page-2',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'page-3',
                                type: 'document',
                                title: 'Page 3',
                                path: 'page-3',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'page-4',
                                type: 'document',
                                title: 'Page 4',
                                path: 'page-4',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'page-5',
                                type: 'document',
                                title: 'Page 5',
                                path: 'page-5',
                                pages: [],
                                hidden: false,
                            },
                        ],
                    },
                })
            ),
            getRevisionPageMarkdown: mock(() =>
                Promise.resolve({
                    data: '# Test Page\n\nSome content\n',
                })
            ),
        };

        const mockContext: GitBookSiteContext = {
            dataFetcher: mockDataFetcher,
            linker: createMockLinker(),
        } as unknown as GitBookSiteContext;

        const mockSiteSpace: SiteSpace = {
            id: 'space-1',
            space: {
                id: 'space-1',
                revision: 'rev-1',
            },
            urls: {
                published: 'https://example.com',
            },
            path: 'test-space',
        } as SiteSpace;

        // Capture stream output
        const chunks: string[] = [];
        const mockController = {
            enqueue: mock((chunk: Uint8Array) => {
                chunks.push(new TextDecoder().decode(chunk));
            }),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;

        const result = await streamMarkdownFromSiteSpaces(
            mockContext,
            mockController,
            [mockSiteSpace],
            'base-path',
            0,
            0
        );

        // Verify results
        expect(result.currentPageIndex).toBe(5); // Should process 5 pages
        expect(result.reachedLimit).toBe(false); // Under limit
        expect(chunks.length).toBe(5); // Should have 5 markdown chunks
        expect(mockDataFetcher.getRevision).toHaveBeenCalledTimes(1);
        expect(mockDataFetcher.getRevisionPageMarkdown).toHaveBeenCalledTimes(5);
    });

    it('applies offset correctly', async () => {
        const mockDataFetcher = {
            getRevision: mock(() =>
                Promise.resolve({
                    data: {
                        pages: Array.from({ length: 10 }, (_, i) => ({
                            id: `page-${i + 1}`,
                            type: 'document',
                            title: `Page ${i + 1}`,
                            path: `page-${i + 1}`,
                            pages: [],
                            hidden: false,
                        })),
                    },
                })
            ),
            getRevisionPageMarkdown: mock(() => Promise.resolve({ data: 'content\n' })),
        };

        const mockContext: GitBookSiteContext = {
            dataFetcher: mockDataFetcher,
            linker: createMockLinker(),
        } as unknown as GitBookSiteContext;

        const mockSiteSpace: SiteSpace = {
            space: { id: 'space-1', revision: 'rev-1' },
            urls: { published: 'https://example.com' },
            path: 'test-space',
        } as SiteSpace;

        const chunks: string[] = [];
        const mockController = {
            enqueue: mock((chunk: Uint8Array) => {
                chunks.push(new TextDecoder().decode(chunk));
            }),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;

        const result = await streamMarkdownFromSiteSpaces(
            mockContext,
            mockController,
            [mockSiteSpace],
            'base-path',
            3, // offset = 3
            0
        );

        // Should process pages from index 3 onwards (7 pages)
        expect(result.currentPageIndex).toBe(10);
        expect(chunks.length).toBe(7); // 10 total - 3 offset = 7 processed
    });

    it('handles pagination when there are more than 100 pages', async () => {
        const mockDataFetcher = {
            getRevision: mock(() =>
                Promise.resolve({
                    data: {
                        pages: Array.from({ length: 150 }, (_, i) => ({
                            id: `page-${i + 1}`,
                            type: 'document',
                            title: `Page ${i + 1}`,
                            path: `page-${i + 1}`,
                            pages: [],
                            hidden: false,
                        })),
                    },
                })
            ),
            getRevisionPageMarkdown: mock(() => Promise.resolve({ data: 'content\n' })),
        };

        const mockContext: GitBookSiteContext = {
            dataFetcher: mockDataFetcher,
            linker: createMockLinker(),
        } as unknown as GitBookSiteContext;

        const mockSiteSpace: SiteSpace = {
            space: { id: 'space-1', revision: 'rev-1' },
            urls: { published: 'https://example.com' },
            path: 'test-space',
        } as SiteSpace;

        const chunks: string[] = [];
        const mockController = {
            enqueue: mock((chunk: Uint8Array) => {
                chunks.push(new TextDecoder().decode(chunk));
            }),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;

        const result = await streamMarkdownFromSiteSpaces(
            mockContext,
            mockController,
            [mockSiteSpace],
            'base-path',
            0,
            0
        );

        // Should only process 100 pages (default limit)
        expect(result.currentPageIndex).toBe(100);
        expect(result.reachedLimit).toBe(true);
        expect(chunks.length).toBe(101); // 100 pages + 1 next page link

        // Check that next page link is included
        const fullContent = chunks.join('');
        expect(fullContent).toContain('[Next Page]');
        expect(fullContent).toContain('/site/llms-full.txt/1');
    });

    it('handles multiple site spaces', async () => {
        const mockDataFetcher = {
            getRevision: mock()
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            pages: [
                                {
                                    id: 'page-1',
                                    type: 'document',
                                    title: 'Space 1 Page 1',
                                    path: 'page-1',
                                    pages: [],
                                    hidden: false,
                                },
                                {
                                    id: 'page-2',
                                    type: 'document',
                                    title: 'Space 1 Page 2',
                                    path: 'page-2',
                                    pages: [],
                                    hidden: false,
                                },
                            ],
                        },
                    })
                )
                .mockReturnValueOnce(
                    Promise.resolve({
                        data: {
                            pages: [
                                {
                                    id: 'page-3',
                                    type: 'document',
                                    title: 'Space 2 Page 1',
                                    path: 'page-3',
                                    pages: [],
                                    hidden: false,
                                },
                                {
                                    id: 'page-4',
                                    type: 'document',
                                    title: 'Space 2 Page 2',
                                    path: 'page-4',
                                    pages: [],
                                    hidden: false,
                                },
                                {
                                    id: 'page-5',
                                    type: 'document',
                                    title: 'Space 2 Page 3',
                                    path: 'page-5',
                                    pages: [],
                                    hidden: false,
                                },
                            ],
                        },
                    })
                ),
            getRevisionPageMarkdown: mock(() => Promise.resolve({ data: 'content\n' })),
        };

        const mockContext: GitBookSiteContext = {
            dataFetcher: mockDataFetcher,
            linker: createMockLinker(),
        } as unknown as GitBookSiteContext;

        const mockSiteSpaces: SiteSpace[] = [
            {
                space: { id: 'space-1', revision: 'rev-1' },
                urls: { published: 'https://example1.com' },
                path: 'space-1',
            },
            {
                space: { id: 'space-2', revision: 'rev-2' },
                urls: { published: 'https://example2.com' },
                path: 'space-2',
            },
        ] as SiteSpace[];

        const chunks: string[] = [];
        const mockController = {
            enqueue: mock((chunk: Uint8Array) => {
                chunks.push(new TextDecoder().decode(chunk));
            }),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;

        const { streamMarkdownFromSiteSpaces } = await import('./llms-full');

        const result = await streamMarkdownFromSiteSpaces(
            mockContext,
            mockController,
            mockSiteSpaces,
            'base-path',
            0,
            0
        );

        // Should process all pages from both spaces (2 + 3 = 5)
        expect(result.currentPageIndex).toBe(5);
        expect(result.reachedLimit).toBe(false);
        expect(chunks.length).toBe(5);
        expect(mockDataFetcher.getRevision).toHaveBeenCalledTimes(2);
    });

    it('skips site spaces without published URLs', async () => {
        const mockDataFetcher = {
            getRevision: mock(),
            getRevisionPageMarkdown: mock(),
        };

        const mockContext: GitBookSiteContext = {
            dataFetcher: mockDataFetcher,
            linker: createMockLinker(),
        } as unknown as GitBookSiteContext;

        const mockSiteSpace: SiteSpace = {
            space: { id: 'space-1', revision: 'rev-1' },
            urls: { published: undefined }, // No published URL
            path: 'test-space',
        } as SiteSpace;

        const mockController = {
            enqueue: mock(),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;

        const result = await streamMarkdownFromSiteSpaces(
            mockContext,
            mockController,
            [mockSiteSpace],
            'base-path',
            0,
            0
        );

        // Should not process any pages
        expect(result.currentPageIndex).toBe(0);
        expect(result.reachedLimit).toBe(false);
        expect(mockDataFetcher.getRevision).not.toHaveBeenCalled();
    });

    it('filters only document type pages', async () => {
        const mockDataFetcher = {
            getRevision: mock(() =>
                Promise.resolve({
                    data: {
                        pages: [
                            {
                                id: 'doc-1',
                                type: 'document',
                                title: 'Document 1',
                                path: 'doc-1',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'group-1',
                                type: 'group',
                                title: 'Group 1',
                                path: 'group-1',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'doc-2',
                                type: 'document',
                                title: 'Document 2',
                                path: 'doc-2',
                                pages: [],
                                hidden: false,
                            },
                            {
                                id: 'link-1',
                                type: 'link',
                                title: 'Link 1',
                                path: 'link-1',
                                pages: [],
                                hidden: false,
                            },
                        ],
                    },
                })
            ),
            getRevisionPageMarkdown: mock(() => Promise.resolve({ data: 'content\n' })),
        };

        const mockContext: GitBookSiteContext = {
            dataFetcher: mockDataFetcher,
            linker: createMockLinker(),
        } as unknown as GitBookSiteContext;

        const mockSiteSpace: SiteSpace = {
            space: { id: 'space-1', revision: 'rev-1' },
            urls: { published: 'https://example.com' },
            path: 'test-space',
        } as SiteSpace;

        const chunks: string[] = [];
        const mockController = {
            enqueue: mock((chunk: Uint8Array) => {
                chunks.push(new TextDecoder().decode(chunk));
            }),
        } as unknown as ReadableStreamDefaultController<Uint8Array>;

        const result = await streamMarkdownFromSiteSpaces(
            mockContext,
            mockController,
            [mockSiteSpace],
            'base-path',
            0,
            0
        );

        // Should only process the 2 document pages
        expect(result.currentPageIndex).toBe(2);
        expect(chunks.length).toBe(2);
        expect(mockDataFetcher.getRevisionPageMarkdown).toHaveBeenCalledTimes(2);
    });
});
