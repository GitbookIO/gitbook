import { describe, expect, it } from 'bun:test';

import type { GitBookAnyContext } from './context';
import { createLinker, linkerWithDirectPagePaths, linkerWithMarkdownPages } from './links';
import { fromPageMarkdown, toPageMarkdown } from './markdownPage';

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
