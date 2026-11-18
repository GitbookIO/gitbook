import { describe, expect, it } from 'bun:test';

import { type LLMsIndexFile, type LLMsIndexNode, renderLLMsIndex } from './llms-index';

const ROOT = 'https://docs.example.com/llms.txt';

function page(path: string, children: LLMsIndexNode[] = []): LLMsIndexNode {
    return {
        kind: 'page',
        title: `Page ${path}`,
        description: `About ${path}`,
        url: `https://docs.example.com/${path}.md`,
        indexURL: `https://docs.example.com/${path}/llms.txt`,
        children,
    };
}

function section(path: string, children: LLMsIndexNode[], indexURL?: string): LLMsIndexNode {
    return {
        kind: 'structure',
        title: `Section ${path}`,
        indexURL: indexURL ?? `https://docs.example.com/${path}/llms.txt`,
        children,
    };
}

function pages(prefix: string, count: number): LLMsIndexNode[] {
    return Array.from({ length: count }, (_, index) => page(`${prefix}/page-${index}`));
}

function file(nodes: LLMsIndexNode[], footer?: string): LLMsIndexFile {
    return { title: 'Docs', url: ROOT, nodes, footer };
}

describe('renderLLMsIndex', () => {
    it('renders everything inline when it fits', () => {
        const output = renderLLMsIndex(
            file([section('guides', [page('guides/start', [page('guides/start/install')])])])
        );

        expect(output).toBe(
            [
                '# Docs',
                '',
                '## Section guides',
                '',
                '- [Page guides/start](https://docs.example.com/guides/start.md): About guides/start',
                '  - [Page guides/start/install](https://docs.example.com/guides/start/install.md): About guides/start/install',
                '',
            ].join('\n')
        );
    });

    it('splits out the largest sections first', () => {
        const output = renderLLMsIndex(
            file([section('small', pages('small', 2)), section('large', pages('large', 50))]),
            3_000
        );

        expect(output.length).toBeLessThanOrEqual(3_000);
        expect(output).toContain('## Section small');
        expect(output).toContain('Page small/page-1');
        expect(output).toContain(
            '## Section large\n\n- [Section large](https://docs.example.com/large/llms.txt)'
        );
        expect(output).not.toContain('Page large/page-1');
    });

    it('never links a node to the file it is rendered in', () => {
        const output = renderLLMsIndex(
            file([section('default', [page('a', pages('a', 30)), page('b', pages('b', 5))], ROOT)]),
            2_000
        );

        expect(output.length).toBeLessThanOrEqual(2_000);
        expect(output).toContain('## Section default');
        expect(output).toContain('- [Page a](https://docs.example.com/a.md): About a');
        expect(output).toContain('  - [Pages under Page a](https://docs.example.com/a/llms.txt)');
        expect(output).not.toContain(ROOT);
    });

    it('serves an oversized index when nothing can be split out', () => {
        const output = renderLLMsIndex(file(pages('flat', 50)), 1_000);

        expect(output.length).toBeGreaterThan(1_000);
        expect(output).toContain('Page flat/page-49');
    });

    it('counts the footer in the size', () => {
        const nodes = [section('a', pages('a', 10)), section('b', pages('b', 10))];
        const withoutFooter = renderLLMsIndex(file(nodes), 2_000);
        const withFooter = renderLLMsIndex(file(nodes, 'x'.repeat(1_000)), 2_000);

        expect(withoutFooter).toContain('Page a/page-1');
        expect(withFooter.length).toBeLessThanOrEqual(2_000);
        expect(withFooter).toContain('- [Section a](https://docs.example.com/a/llms.txt)');
    });

    it('fits large sites within the default limit', () => {
        const nodes = Array.from({ length: 20 }, (_, sectionIndex) =>
            section(
                `s${sectionIndex}`,
                Array.from({ length: 20 }, (_, groupIndex) =>
                    page(
                        `s${sectionIndex}/g${groupIndex}`,
                        pages(`s${sectionIndex}/g${groupIndex}`, 10)
                    )
                )
            )
        );

        const output = renderLLMsIndex(file(nodes));
        expect(output.length).toBeLessThanOrEqual(100_000);
    });
});
