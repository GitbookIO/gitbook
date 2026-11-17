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
        ['/pages/designer', linker.toAbsoluteURL(linker.toPathForPagePath({ path: page.path }))],
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
            `<table><tr><td><a href="${linker.toAbsoluteURL(linker.toPathForPagePath({ path: page.path }))}">${page.title}</a></td></tr></table>\n`
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

describe('Markdown URL context', () => {
    it.each([
        ['docs.example.com', '/docs/api/v2/', '/docs/', 'https://docs.example.com/docs/api/v2/'],
        [
            'preview.example.com',
            '/s/site/section/v2/',
            '/s/site/',
            'https://preview.example.com/s/site/section/v2/',
        ],
    ])(
        'preserves the served origin and section path on %s',
        async (host, spaceBasePath, siteBasePath, base) => {
            const scoped = {
                ...context,
                linker: linkerWithMarkdownPages(
                    createLinker({ host, spaceBasePath, siteBasePath })
                ),
            };
            const markdown =
                '[Page](/pages/designer)\n\n[Anchor](/pages/designer#details)\n\n[Here](#details)\n\n[Missing](/pages/missing)\n\n[External](https://external.example/a?q=1#b)\n\n[Mail](mailto:test@example.com)\n\n[File](/files/dark-image)\n\n[Relative](../guide?q=1#b)\n\n[Stable][s]\n\n[s]: /pages/designer\n\n[Definition][d]\n\n[d]: ../guide?q=1#b\n\n[Fragment][f]\n\n[f]: #details\n\n![Image](./image.png)\n\n<a href="../guide?q=1&#x26;b=2#b">Guide</a>\n';
            const result = toPageMarkdown(
                await fromPageMarkdown(scoped, { markdown, pagePath: 'nested/current' })
            );
            expect(result).toContain(`${base}${page.path}.md`);
            expect(result).toContain(`${base}${page.path}.md#details`);
            expect(result).toContain('[Here](#details)');
            expect(result).toContain('broken://pages/missing');
            expect(result).toContain('https://external.example/a?q=1#b');
            expect(result).toContain('mailto:test@example.com');
            expect(result).toContain(file.downloadURL.replace('&', '\\&'));
            expect(result).toContain(`[Relative](${base}guide?q=1#b)`);
            expect(result).toContain(`[s]: ${base}${page.path}.md`);
            expect(result).toContain(`[d]: ${base}guide?q=1#b`);
            expect(result).toContain('[f]: #details');
            expect(result).toContain(`![Image](${base}nested/image.png)`);
            expect(result).toContain(`<a href="${base}guide?q=1&amp;b=2#b">Guide</a>`);
        }
    );
});

it('keeps malformed destinations from breaking the page export', async () => {
    const markdown =
        '<a href="http://">Broken</a>\n\n<img src="http://" alt="Broken">\n\n![Broken](http://)\n\n[Broken](http://)\n';
    expect(await rewrite(markdown)).toBe(markdown);
});

it('preserves document fragments in generated answers without a page path', async () => {
    const markdown =
        '[Details](#details)\n\n[Details][d]\n\n[d]: #details\n\n<a href="#details">Details</a>\n';
    expect(toPageMarkdown(await fromPageMarkdown(context, { markdown, pagePath: '' }))).toBe(
        markdown
    );
});

it.each(['/docs/', '/docs/api/v2/', '/guide/'])(
    'resolves relative assets in answers from the space root %s',
    async (basePath) => {
        const scoped = {
            ...context,
            linker: linkerWithMarkdownPages(
                createLinker({
                    host: 'docs.example.com',
                    siteBasePath: basePath,
                    spaceBasePath: basePath,
                })
            ),
        };
        const markdown =
            '![Image](./image.png)\n\n[Guide][d]\n\n[d]: ./guide\n\n<a href="./guide">Guide</a>\n';
        const output = toPageMarkdown(await fromPageMarkdown(scoped, { markdown, pagePath: '' }));
        expect(output).toContain(`![Image](https://docs.example.com${basePath}image.png)`);
        expect(output).toContain(`[d]: https://docs.example.com${basePath}guide`);
        expect(output).toContain(`<a href="https://docs.example.com${basePath}guide">Guide</a>`);
    }
);

it('preserves code examples and unrelated attributes in raw HTML', async () => {
    const markdown =
        '<table><tr><td><code>const src="example"; const href="/pages/designer";</code></td></tr></table>\n\n<pre>const src="example"</pre>\n\n<div data-src="./example" data-srcset="./one 1x, ./two 2x">Example</div>\n\n<!-- <img src="./example"> -->\n';
    expect(await rewrite(markdown)).toBe(markdown);
});

it.each([
    "<a href='/pages/designer'>Designer</a>",
    '<A HREF="/pages/designer">Designer</A>',
    '<a href = "/pages/designer">Designer</a>',
])('resolves HTML attributes in %s', async (html) => {
    const output = await rewrite(html);
    expect(output).toContain(
        'href="https://docs.example.com/workflows/about-the-workflow-designer.md"'
    );
    expect(output).toContain('>Designer</');
});

it.each([
    ['//cdn.example.org/file', 'https://cdn.example.org/file'],
    ['/docs/guide', 'https://docs.example.com/docs/guide'],
    ['?view=full', 'https://docs.example.com/workflows/nested/current.md?view=full'],
    ['./guide?q=1#part', 'https://docs.example.com/workflows/nested/guide?q=1#part'],
    ['../guide', 'https://docs.example.com/workflows/guide'],
])('resolves %s consistently across Markdown and HTML destinations', async (url, expected) => {
    const markdown = `[Inline](${url})\n\n[Definition][d]\n\n[d]: ${url}\n\n![Image](${url})\n\n<a href="${url}">HTML</a><img src="${url}">\n`;
    const output = toPageMarkdown(
        await fromPageMarkdown(context, { markdown, pagePath: 'nested/current' })
    );
    expect(output).toContain(`[Inline](${expected})`);
    expect(output).toContain(`[d]: ${expected}`);
    expect(output).toContain(`![Image](${expected})`);
    expect(output).toContain(`<a href="${expected}">HTML</a><img src="${expected}">`);
});

it('preserves overlapping HTML formatting when parser nodes share a source range', async () => {
    const id = 'averylongbutvalidpageidentifier1234567890';
    const scoped = {
        ...context,
        revision: {
            ...context.revision,
            pages: context.revision.pages.map((entry) => ({ ...entry, id, path: 'a', slug: 'a' })),
        },
        linker: linkerWithMarkdownPages(
            createLinker({ host: 'd.io', siteBasePath: '/', spaceBasePath: '/' })
        ),
    };
    const markdown = `<div><b><a href="/pages/${id}">one</b>two</a></div>\n`;
    expect(toPageMarkdown(await fromPageMarkdown(scoped, { markdown, pagePath: 'current' }))).toBe(
        '<div><b><a href="https://d.io/a.md">one</b>two</a></div>\n'
    );
});

it('resolves image attributes and srcset candidates with HTML syntax variants', async () => {
    const markdown =
        "<PICTURE><SOURCE SRCSET='/files/dark-image 1x, //cdn.example.com/image.png 2x'><IMG SRC = '/files/dark-image' alt='Example'></PICTURE>\n";
    const output = await rewrite(markdown);
    const url = file.downloadURL.replaceAll('&', '&amp;');
    expect(output).toBe(
        `<PICTURE><SOURCE srcset="${url} 1x, https://cdn.example.com/image.png 2x"><IMG src="${url}" alt='Example'></PICTURE>\n`
    );
});
