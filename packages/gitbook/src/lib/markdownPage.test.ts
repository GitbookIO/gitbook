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
const file = {
    id: 'dark-image',
    name: 'dark.png',
    downloadURL: 'https://example.com/dark.png?alt=media&token=test',
};
const context = {
    space: {
        id: 'workflows',
        title: 'Workflows',
        urls: { published: 'https://docs.example.com/workflows/' },
    },
    revision: { pages: [page], files: [file] },
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

describe('HTML images in page markdown', () => {
    it.each([
        '/files/dark-image',
        ' /files/dark-image ',
        '/files/dark-image 1x, /files/dark-image 2x',
        '/files/dark-image 1x,/files/dark-image 2x',
        '/files/dark-image, https://example.com/external.png 2x',
        '/files/dark-image 640w, https://example.com/external.png 1280w',
        'https://example.com/external.png?crop=1,2 1x, /files/dark-image 2x',
        'data:image/png;base64,AAAA 1x, /files/dark-image 2x',
    ])('resolves srcset candidates and preserves descriptors in %s', async (srcset) => {
        const markdown = `<picture><source srcset="${srcset}" media="(prefers-color-scheme: dark)"><img src="/files/dark-image" alt="Example"></picture>\n`;
        expect(await rewrite(markdown)).toBe(
            markdown.replaceAll('/files/dark-image', file.downloadURL.replaceAll('&', '&amp;'))
        );
    });
});
