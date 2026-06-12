import { describe, expect, it } from 'bun:test';
import { type AIChatReference, serializeReferences } from './references';

describe('serializeReferences', () => {
    it('returns an empty string when there are no references', () => {
        expect(serializeReferences([])).toBe('');
    });

    it('serializes a single page reference as a markdown link', () => {
        const refs: AIChatReference[] = [
            { type: 'page', id: 'page-1', label: 'Getting started', href: '/getting-started' },
        ];
        const result = serializeReferences(refs);
        expect(result).toContain('The user is referring to the following page they are reading');
        expect(result).toContain('- [Getting started](/getting-started)');
        expect(result.endsWith('\n\n---\n\n')).toBe(true);
    });

    it('falls back to the path when no href is provided', () => {
        const refs: AIChatReference[] = [
            { type: 'page', id: 'page-1', label: 'Overview', path: 'getting-started' },
        ];
        const result = serializeReferences(refs);
        expect(result).toContain('- [Overview](getting-started)');
    });

    it('renders a quoted label when neither href nor path is provided', () => {
        const refs: AIChatReference[] = [{ type: 'page', id: 'page-1', label: 'Overview' }];
        const result = serializeReferences(refs);
        expect(result).toContain('- "Overview"');
        expect(result).not.toContain('](');
    });

    it('uses the plural form for multiple pages', () => {
        const refs: AIChatReference[] = [
            { type: 'page', id: 'page-1', label: 'One' },
            { type: 'page', id: 'page-2', label: 'Two' },
        ];
        const result = serializeReferences(refs);
        expect(result).toContain('the following pages they are reading');
        expect(result).toContain('in the context of them');
    });

    it('serializes a single code block reference', () => {
        const refs: AIChatReference[] = [
            {
                type: 'code-block',
                id: 'code-1',
                label: 'main.ts',
                content: 'const a = 1;',
                syntax: 'ts',
            },
        ];
        const result = serializeReferences(refs);
        expect(result).toContain('The user is referring to the following code block');
        expect(result).toContain('main.ts\n```ts\nconst a = 1;\n```');
    });

    it('escapes backtick fences inside the code content', () => {
        const refs: AIChatReference[] = [
            { type: 'code-block', id: 'code-1', content: 'a ``` b', syntax: 'md' },
        ];
        const result = serializeReferences(refs);
        expect(result).toContain('````md\na ``` b\n````');
    });

    it('groups page and code references into distinct sections', () => {
        const refs: AIChatReference[] = [
            { type: 'page', id: 'page-1', label: 'Quickstart' },
            { type: 'code-block', id: 'code-1', content: 'x', syntax: 'js' },
        ];
        const result = serializeReferences(refs);
        const pageIndex = result.indexOf('referring to the following page');
        const codeIndex = result.indexOf('referring to the following code block');
        expect(pageIndex).toBeGreaterThanOrEqual(0);
        expect(codeIndex).toBeGreaterThan(pageIndex);
    });
});
