import { describe, expect, it, mock } from 'bun:test';

import { type RevisionPageDocument, SiteVisibility } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from '@/lib/links';

mock.module('server-only', () => ({}));

const { servePageMarkdown, toMarkdownDestination } = await import('./markdownPage');

const page = {
    id: 'page-1',
    title: 'New page',
    kind: 'sheet',
    type: 'document',
    path: 'new-page',
    slug: 'new-page',
    pages: [],
} as unknown as RevisionPageDocument;

function createContext(options: {
    siteRedirect?: { target: string; permanent?: boolean };
    spaceRedirectPageId?: string;
}) {
    return {
        displayAgentInstructions: false,
        organizationId: 'org-1',
        site: { id: 'site-1', visibility: SiteVisibility.Public },
        siteSpace: { id: 'site-space-1' },
        space: { id: 'space-1', revision: 'revision-1' },
        revisionId: 'revision-1',
        revision: { pages: [page] },
        linker: createLinker({
            host: 'docs.example.com',
            siteBasePath: '/docs/',
            spaceBasePath: '/docs/',
        }),
        dataFetcher: {
            getRevisionPageMarkdown: async () => ({
                data: '# New page\n\n[Read this page](/pages/page-1)\n',
            }),
            getSiteRedirectBySource: async ({ source }: { source: string }) =>
                options.siteRedirect && source === '/old-page'
                    ? {
                          data: {
                              target: options.siteRedirect.target,
                              redirect: { permanent: options.siteRedirect.permanent ?? false },
                          },
                      }
                    : { error: { code: 404, message: 'Not found' } },
            getRevisionPageByPath: async () =>
                options.spaceRedirectPageId
                    ? { data: { id: options.spaceRedirectPageId } }
                    : { error: { code: 404, message: 'Not found' } },
        },
    } as unknown as GitBookSiteContext;
}

describe('servePageMarkdown', () => {
    it('serves page links that can be opened without the source origin', async () => {
        const response = await servePageMarkdown(createContext({}), 'new-page');
        expect(response.status).toBe(200);
        expect(await response.text()).toContain(
            '[Read this page](https://docs.example.com/docs/new-page.md)'
        );
    });

    it('serves the current revision by selector with a noindex header for AI agents', async () => {
        const context = createContext({});
        const response = await servePageMarkdown(
            {
                ...context,
                isAiAgent: true,
                linker: context.linker.fork({
                    spaceBasePath: `/docs/~/revisions/${context.revisionId}/`,
                }),
            },
            'new-page'
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    });

    it('redirects to the markdown version of a site redirect target', async () => {
        const context = createContext({
            siteRedirect: { target: 'https://docs.example.com/docs/new-page', permanent: true },
        });

        const response = await servePageMarkdown(context, 'old-page');

        expect(response.status).toBe(308);
        expect(response.headers.get('Location')).toBe('/docs/new-page.md');
    });

    it('redirects to the markdown version of a space redirect target', async () => {
        const context = createContext({ spaceRedirectPageId: page.id });

        const response = await servePageMarkdown(context, 'old-page');

        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toBe('/docs/new-page.md');
    });
});

describe('toMarkdownDestination', () => {
    it('appends .md to same-site paths', () => {
        expect(toMarkdownDestination('/docs/new-page')).toBe('/docs/new-page.md');
        expect(toMarkdownDestination('/docs/new-page/?a=1#b')).toBe('/docs/new-page.md?a=1#b');
    });

    it('points the site root to its markdown route', () => {
        expect(toMarkdownDestination('/')).toBe('/.md');
        expect(toMarkdownDestination('/?a=1#b')).toBe('/.md?a=1#b');
    });

    it('leaves markdown paths and external URLs untouched', () => {
        expect(toMarkdownDestination('/docs/new-page.md')).toBe('/docs/new-page.md');
        expect(toMarkdownDestination('https://example.com/page')).toBe('https://example.com/page');
    });
});
