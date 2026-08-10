import { describe, expect, it } from 'bun:test';
import type { RevisionPageDocument } from '@gitbook/api';
import type { GitBookSiteContext } from './context';
import { createLinker } from './links';
import {
    getLLMsTxtURL,
    getPageMarkdownURL,
    renderLLMsTxtMarkdownDirective,
} from './llms-directive';

describe('llms directive', () => {
    const context = {
        linker: createLinker({
            host: 'docs.company.com',
            siteBasePath: '/docs',
            spaceBasePath: '/docs/v1',
        }),
    } as GitBookSiteContext;

    const page = {
        path: 'guides/start',
    } as RevisionPageDocument;

    it('links llms.txt from the site root', () => {
        expect(getLLMsTxtURL(context)).toBe('https://docs.company.com/docs/llms.txt');
    });

    it('links page markdown from the current space', () => {
        expect(getPageMarkdownURL(context, page)).toBe(
            'https://docs.company.com/docs/v1/guides/start.md'
        );
    });

    it('renders a markdown blockquote directive', () => {
        expect(renderLLMsTxtMarkdownDirective(context, page)).toBe(
            '> For the complete documentation index, see [llms.txt](https://docs.company.com/docs/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.company.com/docs/v1/guides/start.md).'
        );
    });
});
