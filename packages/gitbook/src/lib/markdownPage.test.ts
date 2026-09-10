import { describe, expect, it } from 'bun:test';

import type { RevisionPageDocument } from '@gitbook/api';

import type { GitBookAnyContext, GitBookSiteContext } from './context';
import { createLinker, linkerWithDirectPagePaths, linkerWithMarkdownPages } from './links';
import { fromPageMarkdown, getMarkdownForPage, toPageMarkdown } from './markdownPage';

const page = {
    id: 'designer',
    type: 'document',
    title: 'About the Workflow Designer',
    path: 'about-the-workflow-designer',
    slug: 'about-the-workflow-designer',
    pages: [],
    layout: {},
};
const linker = linkerWithMarkdownPages(
    linkerWithDirectPagePaths(
        createLinker({ host: 'docs.example.com', spaceBasePath: '/workflows/', siteBasePath: '/' })
    )
);
const context = {
    space: {
        id: 'workflows',
        title: 'Workflows',
        urls: { published: 'https://docs.example.com/workflows/' },
    },
    revision: { pages: [page], files: [] },
    linker,
} as unknown as GitBookAnyContext;

async function rewrite(markdown: string) {
    return toPageMarkdown(await fromPageMarkdown(context, { markdown, pagePath: 'workflows' }));
}

async function renderPage(
    markdown: string,
    pageOverrides: Omit<Partial<RevisionPageDocument>, 'layout'> & {
        layout?: Partial<RevisionPageDocument['layout']>;
    }
) {
    const page = {
        ...pageBase,
        ...pageOverrides,
        layout: {
            ...pageBase.layout,
            ...pageOverrides.layout,
        },
    } as RevisionPageDocument;

    return getMarkdownForPage(
        {
            ...context,
            revisionId: 'revision',
            dataFetcher: {
                getRevisionPageMarkdown: async () => ({ data: markdown }),
            },
        } as unknown as GitBookSiteContext,
        { page, ancestors: [] }
    );
}

const pageBase = {
    ...page,
    layout: {
        description: true,
    },
} as RevisionPageDocument;

describe('page descriptions in markdown', () => {
    it('renders visible descriptions immediately after the H1', async () => {
        expect(
            await renderPage('# About the Workflow Designer\n\nSome content.', {
                description: 'Design workflows visually.',
            })
        ).toBe('# About the Workflow Designer\n\nDesign workflows visually.\n\nSome content.\n');
    });

    it('omits hidden and missing descriptions', async () => {
        const pageMarkdown = '# About the Workflow Designer\n\nSome content.';
        const markdown = await renderPage(pageMarkdown, {
            description: 'Design workflows visually.',
            layout: { description: false },
        });

        expect(markdown).toBe('# About the Workflow Designer\n\nSome content.\n');
        expect(await renderPage(pageMarkdown, {})).toBe(
            '# About the Workflow Designer\n\nSome content.\n'
        );
    });

    it('keeps child links for an otherwise empty parent page', async () => {
        const markdown = await renderPage('# Workflows\n', {
            title: 'Workflows',
            description: 'Build and manage workflows.',
            pages: [
                {
                    ...pageBase,
                    id: 'child',
                    title: 'First workflow',
                    path: 'first-workflow',
                    slug: 'first-workflow',
                    pages: [],
                },
            ],
        });

        expect(markdown).toContain('# Workflows');
        expect(markdown).toContain('Build and manage workflows.');
        expect(markdown).toContain('First workflow');
    });
});

describe('HTML links in page markdown', () => {
    it.each([
        ['/pages/designer', linker.toPathForPagePath({ path: page.path })],
        ['/spaces/workflows', context.space.urls.published],
        ['/pages/missing', 'broken://pages/missing'],
    ])(
        'resolves an inline button targeting %s without changing its label or attributes',
        async (ref, expected) => {
            const button = `<a href="${ref}" class="button primary" data-icon="triple-chevrons-right">About the designer</a>`;
            const markdown = `{% columns %}\n{% column %}\n\n${button}\n{% endcolumn %}\n{% endcolumns %}\n`;
            expect(await rewrite(markdown)).toBe(
                markdown.replace(`href="${ref}"`, `href="${expected}"`)
            );
        }
    );

    it('preserves title replacement for complete card anchors', async () => {
        const markdown =
            '<table><tr><td><a href="/pages/designer">/pages/designer</a></td></tr></table>\n';
        expect(await rewrite(markdown)).toBe(
            `<table><tr><td><a href="${linker.toPathForPagePath({ path: page.path })}">${page.title}</a></td></tr></table>\n`
        );
    });
});
