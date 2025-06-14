import { describe, expect, it, mock, beforeEach } from 'bun:test';
import type { ContentRef, RevisionPage, Space } from '@gitbook/api';
import type { GitBookSpaceContext } from '@v2/lib/context';

// Mock the resolvePageId function which is the key dependency we're testing
const mockResolvePageId = mock();

// Mock other dependencies before importing
mock.module('@v2/lib/data', () => ({
    getDataOrNull: mock((promise: Promise<any>) => promise.catch(() => null)),
    getPageDocument: mock(),
    ignoreDataThrownError: mock((promise: Promise<any>) => promise.catch(() => null)),
}));

mock.module('@v2/lib/context', () => ({
    fetchSpaceContextByIds: mock().mockResolvedValue({
        space: { 
            id: 'parent-space', 
            title: 'Parent Space',
            urls: {
                published: 'https://example.com/space/parent-space',
                app: 'https://app.gitbook.com/s/parent-space',
            },
        },
        pages: [],
        revisionId: 'rev-1',
        organizationId: 'org-1',
        changeRequest: null,
        shareKey: undefined,
        dataFetcher: {
            getSpace: mock().mockResolvedValue(null),
            getPublishedContentSite: mock().mockResolvedValue(null),
        },
        linker: {
            toPathForPage: mock(({ page }: { page: RevisionPage }) => `/page/${page.id}`),
            toAbsoluteURL: mock((url: string) => `https://example.com${url}`),
        },
    }),
}));

mock.module('@v2/lib/links', () => ({
    createLinker: mock().mockReturnValue({
        toAbsoluteURL: mock((url: string) => `https://example.com${url}`),
        toPathForPage: mock(({ page }: { page: RevisionPage }) => `/page/${page.id}`),
        toLinkForContent: mock((url: string) => url),
    }),
}));

mock.module('./pages', () => ({
    resolvePageId: mockResolvePageId,
}));

mock.module('./sites', () => ({
    findSiteSpaceById: mock(),
}));

mock.module('./app', () => ({
    getGitBookAppHref: mock((path: string) => `https://app.gitbook.com${path}`),
}));

mock.module('./document', () => ({
    getBlockById: mock(),
    getBlockTitle: mock(),
}));

mock.module('../components/PageIcon', () => ({
    PageIcon: mock().mockReturnValue(null),
}));

import { resolveContentRef } from './references';

const createMockSpace = (id: string, title: string): Space => ({
    id,
    title,
    urls: {
        published: `https://example.com/space/${id}`,
        app: `https://app.gitbook.com/s/${id}`,
    },
    organization: 'org-1',
    revision: 'rev-1',
} as Space);

const createMockPage = (id: string, title: string): RevisionPage => ({
    id,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    type: 'page',
} as RevisionPage);

const createMockContext = (
    space: Space,
    pages: RevisionPage[],
    parentSpaceContext?: GitBookSpaceContext['parentSpaceContext']
): GitBookSpaceContext => ({
    organizationId: 'org-1',
    space,
    changeRequest: null,
    revisionId: 'rev-1',
    pages,
    shareKey: undefined,
    dataFetcher: {
        getSpace: mock().mockResolvedValue(null),
        getPublishedContentSite: mock().mockResolvedValue(null),
    } as any,
    linker: {
        toPathForPage: mock(({ page }: { page: RevisionPage }) => `/page/${page.id}`),
        toAbsoluteURL: mock((url: string) => `https://example.com${url}`),
    } as any,
    parentSpaceContext,
});

describe('resolveContentRef - parent space context functionality', () => {
    beforeEach(() => {
        mockResolvePageId.mockReset();
    });

    describe('page resolution with parent space context', () => {
        it('should resolve page from current space when available', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const parentSpace = createMockSpace('parent-space', 'Parent Space');
            
            const currentPages = [createMockPage('page-1', 'Current Page')];
            const parentPages = [createMockPage('page-2', 'Parent Page')];
            
            const context = createMockContext(currentSpace, currentPages, {
                space: parentSpace,
                revisionId: 'rev-1',
                pages: parentPages,
                shareKey: undefined,
            });

            const contentRef: ContentRef = {
                kind: 'page',
                page: 'page-1',
            };

            // Mock resolvePageId to return the page from current space
            const currentPageResult = { page: currentPages[0], ancestors: [] };
            mockResolvePageId.mockReturnValue(currentPageResult);

            const result = await resolveContentRef(contentRef, context);

            expect(result).not.toBeNull();
            expect(result?.text).toBe('Current Page');
            expect(result?.href).toBe('/page/page-1');
            expect(mockResolvePageId).toHaveBeenCalledWith(currentPages, 'page-1');
        });

        it('should attempt to resolve from parent space when not found in current space', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const parentSpace = createMockSpace('parent-space', 'Parent Space');
            
            const currentPages: RevisionPage[] = [];
            const parentPages = [createMockPage('page-2', 'Parent Page')];
            
            const context = createMockContext(currentSpace, currentPages, {
                space: parentSpace,
                revisionId: 'rev-1',
                pages: parentPages,
                shareKey: undefined,
            });

            const contentRef: ContentRef = {
                kind: 'page',
                page: 'page-2',
            };

            // Mock resolvePageId to return undefined for current space, then return page for parent space
            mockResolvePageId
                .mockReturnValueOnce(undefined) // First call with current pages
                .mockReturnValueOnce({ page: parentPages[0], ancestors: [] }); // Second call with parent pages

            const result = await resolveContentRef(contentRef, context);

            // The function should check both current space and parent space
            expect(mockResolvePageId).toHaveBeenCalledWith(currentPages, 'page-2');
            expect(mockResolvePageId).toHaveBeenCalledWith(parentPages, 'page-2');
            // Note: resolveContentRefInSpace may call resolvePageId again, so we check for at least 2 calls
            expect(mockResolvePageId.mock.calls.length).toBeGreaterThanOrEqual(2);
        });

        it('should return null when page not found in either current or parent space', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const parentSpace = createMockSpace('parent-space', 'Parent Space');
            
            const currentPages: RevisionPage[] = [];
            const parentPages: RevisionPage[] = [];
            
            const context = createMockContext(currentSpace, currentPages, {
                space: parentSpace,
                revisionId: 'rev-1',
                pages: parentPages,
                shareKey: undefined,
            });

            const contentRef: ContentRef = {
                kind: 'page',
                page: 'non-existent-page',
            };

            // Mock resolvePageId to return undefined for both spaces
            mockResolvePageId.mockReturnValue(undefined);

            const result = await resolveContentRef(contentRef, context);

            expect(result).toBeNull();
            expect(mockResolvePageId).toHaveBeenCalledTimes(2);
        });

        it('should work without parent space context (original behavior)', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const currentPages = [createMockPage('page-1', 'Current Page')];
            
            const context = createMockContext(currentSpace, currentPages);

            const contentRef: ContentRef = {
                kind: 'page',
                page: 'page-1',
            };

            // Mock resolvePageId to return the page
            const pageResult = { page: currentPages[0], ancestors: [] };
            mockResolvePageId.mockReturnValue(pageResult);

            const result = await resolveContentRef(contentRef, context);

            expect(result).not.toBeNull();
            expect(result?.text).toBe('Current Page');
            expect(mockResolvePageId).toHaveBeenCalledTimes(1);
            expect(mockResolvePageId).toHaveBeenCalledWith(currentPages, 'page-1');
        });

        it('should return null when page not found and no parent space context', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const currentPages: RevisionPage[] = [];
            
            const context = createMockContext(currentSpace, currentPages);

            const contentRef: ContentRef = {
                kind: 'page',
                page: 'non-existent-page',
            };

            // Mock resolvePageId to return undefined
            mockResolvePageId.mockReturnValue(undefined);

            const result = await resolveContentRef(contentRef, context);

            expect(result).toBeNull();
            expect(mockResolvePageId).toHaveBeenCalledTimes(1);
        });

        it('should handle anchor references with parent space fallback', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const parentSpace = createMockSpace('parent-space', 'Parent Space');
            
            const currentPages: RevisionPage[] = [];
            const parentPages = [createMockPage('page-2', 'Parent Page')];
            
            const context = createMockContext(currentSpace, currentPages, {
                space: parentSpace,
                revisionId: 'rev-1',
                pages: parentPages,
                shareKey: undefined,
            });

            const contentRef: ContentRef = {
                kind: 'anchor',
                page: 'page-2',
                anchor: 'section-1',
            };

            // Mock resolvePageId to return undefined for current space, then return page for parent space
            mockResolvePageId
                .mockReturnValueOnce(undefined) // First call with current pages
                .mockReturnValueOnce({ page: parentPages[0], ancestors: [] }); // Second call with parent pages

            const result = await resolveContentRef(contentRef, context);

            // The function should check both current space and parent space
            expect(mockResolvePageId).toHaveBeenCalledWith(currentPages, 'page-2');
            expect(mockResolvePageId).toHaveBeenCalledWith(parentPages, 'page-2');
            // Note: resolveContentRefInSpace may call resolvePageId again, so we check for at least 2 calls
            expect(mockResolvePageId.mock.calls.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('other content ref types should not be affected', () => {
        it('should handle URL references normally', async () => {
            const currentSpace = createMockSpace('current-space', 'Current Space');
            const context = createMockContext(currentSpace, []);

            const contentRef: ContentRef = {
                kind: 'url',
                url: 'https://example.com',
            };

            const result = await resolveContentRef(contentRef, context);

            expect(result).not.toBeNull();
            expect(result?.href).toBe('https://example.com');
            expect(result?.text).toBe('https://example.com');
            expect(mockResolvePageId).not.toHaveBeenCalled();
        });
    });
});