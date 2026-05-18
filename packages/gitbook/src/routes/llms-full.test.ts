import { describe, expect, it, mock } from 'bun:test';

type TestPage = {
    id: string;
    type: 'document';
    path: string;
    title: string;
};

type TestSiteSpace = {
    urls: { published: string };
    space: { id: string; revision: string };
};

type TestSiteSpaceContext = {
    space: { id: string };
    revisionId: string;
    revision: { pages: TestPage[] };
    markdownFetches: string[];
    dataFetcher: {
        getRevisionPageMarkdown: (input: { pageId: string }) => Promise<string>;
    };
};

type TestContext = {
    locale: string;
    structure: {
        type: 'sections';
        sections: Array<{ siteSpaces: TestSiteSpace[] }>;
    };
    linker: { toPathInSite: (path: string) => string };
    siteSpaceContexts: Record<string, TestSiteSpaceContext>;
};

type TestMarkdownTree = {
    children: Array<{
        children: Array<{ value: string }>;
    }>;
};

mock.module('@/lib/context', () => ({
    checkIsRootSiteContext: () => true,
    fetchSiteContextForSiteSpace: async (context: TestContext, siteSpace: TestSiteSpace) => {
        return context.siteSpaceContexts[siteSpace.space.id];
    },
}));

mock.module('@/lib/data', () => ({
    throwIfDataError: (value: unknown) => value,
}));

mock.module('@/lib/markdownPage', () => ({
    fromPageMarkdown: async (
        _context: TestSiteSpaceContext,
        { markdown }: { markdown: string }
    ) => ({
        type: 'root',
        children: [
            {
                type: 'heading',
                depth: 1,
                children: [{ type: 'text', value: markdown }],
            },
        ],
    }),
    toPageMarkdown: (tree: TestMarkdownTree) => {
        const [heading] = tree.children;
        const [text] = heading?.children ?? [];
        return `# ${text?.value}`;
    },
}));

mock.module('@/lib/sitemap', () => ({
    getIndexablePages: (pages: TestPage[]) => pages.map((page) => ({ page })),
}));

mock.module('@/lib/sites', () => ({
    filterSiteSpacesByLocale: (siteSpaces: TestSiteSpace[]) => siteSpaces,
    getSiteStructureSections: (structure: TestContext['structure']) => structure.sections,
}));

const { serveLLMsFullTxt } = await import('./llms-full');

function createSiteSpace(id: string): TestSiteSpace {
    return {
        urls: { published: `https://example.com/${id}` },
        space: { id, revision: `${id}-revision` },
    };
}

function createPages(spaceId: string, count: number): TestPage[] {
    return Array.from({ length: count }, (_, index) => ({
        id: `${spaceId}-page-${index}`,
        type: 'document',
        path: `${spaceId}/page-${index}`,
        title: `${spaceId} page ${index}`,
    }));
}

function createSiteSpaceContext(spaceId: string, pageCount: number): TestSiteSpaceContext {
    const markdownFetches: string[] = [];

    return {
        space: { id: spaceId },
        revisionId: `${spaceId}-revision`,
        revision: { pages: createPages(spaceId, pageCount) },
        markdownFetches,
        dataFetcher: {
            getRevisionPageMarkdown: async ({ pageId }: { pageId: string }) => {
                markdownFetches.push(pageId);
                return pageId;
            },
        },
    };
}

function createContext(pageCounts = { 'first-space': 101, 'second-space': 1 }): TestContext {
    const siteSpaceContexts = {
        'first-space': createSiteSpaceContext('first-space', pageCounts['first-space']),
        'second-space': createSiteSpaceContext('second-space', pageCounts['second-space']),
    };

    return {
        locale: 'en',
        structure: {
            type: 'sections',
            sections: [
                { siteSpaces: [createSiteSpace('first-space')] },
                { siteSpaces: [createSiteSpace('second-space')] },
            ],
        },
        linker: {
            toPathInSite: (path: string) => `/${path}`,
        },
        siteSpaceContexts,
    };
}

describe('serveLLMsFullTxt', () => {
    it('paginates globally across sections', async () => {
        const firstResponse = await serveLLMsFullTxt(createContext() as never);
        const firstText = await firstResponse.text();

        expect(firstResponse.status).toBe(200);
        expect(firstText).toContain('# first-space-page-99');
        expect(firstText).not.toContain('# first-space-page-100');
        expect(firstText).not.toContain('# second-space-page-0');
        expect(firstText).toContain('[Next Page](/llms-full.txt/1)');

        const secondResponse = await serveLLMsFullTxt(createContext() as never, 1);
        const secondText = await secondResponse.text();

        expect(secondResponse.status).toBe(200);
        expect(secondText).toContain('# first-space-page-100');
        expect(secondText).toContain('# second-space-page-0');
    });

    it('returns 404 when there are no pages to stream', async () => {
        const response = await serveLLMsFullTxt(
            createContext({ 'first-space': 0, 'second-space': 0 }) as never
        );

        expect(response.status).toBe(404);
        expect(await response.text()).toBe('No content found');
    });

    it('returns 404 when the requested page has no content', async () => {
        const response = await serveLLMsFullTxt(createContext() as never, 2);

        expect(response.status).toBe(404);
        expect(await response.text()).toBe('No content found');
    });

    it('does not fetch markdown before the response stream is read', async () => {
        const context = createContext();
        const response = await serveLLMsFullTxt(context as never);

        expect(response.status).toBe(200);
        expect(context.siteSpaceContexts['first-space']?.markdownFetches).toHaveLength(0);
        expect(context.siteSpaceContexts['second-space']?.markdownFetches).toHaveLength(0);

        await response.text();

        expect(context.siteSpaceContexts['first-space']?.markdownFetches).toHaveLength(100);
        expect(context.siteSpaceContexts['second-space']?.markdownFetches).toHaveLength(0);
    });
});
