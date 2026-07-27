import { describe, expect, it } from 'bun:test';
import { generateSelectCSS, selectSetClassName } from './generateSelectCSS';

// The actual show/hide behaviour of this CSS (most-recent option wins, others hidden, default
// fallback) is verified in a real browser in e2e/select.spec.ts. These unit tests only cover the
// pure contract of the helpers, independent of how the selectors are constructed.

describe('selectSetClassName', () => {
    it('is independent of candidate order', () => {
        expect(selectSetClassName(['python', 'go'])).toBe(selectSetClassName(['go', 'python']));
    });

    it('ignores duplicates and empty slugs', () => {
        expect(selectSetClassName(['python', '', 'python', 'go'])).toBe(
            selectSetClassName(['go', 'python'])
        );
    });

    it('differs for different sets', () => {
        expect(selectSetClassName(['python', 'go'])).not.toBe(selectSetClassName(['python', 'js']));
    });
});

describe('generateSelectCSS', () => {
    it('returns nothing for a degenerate set', () => {
        expect(generateSelectCSS([])).toBe('');
        expect(generateSelectCSS(['', ''])).toBe('');
    });

    it('scopes the generated rules to the set class', () => {
        const css = generateSelectCSS(['python', 'go']);
        expect(css).toContain(selectSetClassName(['python', 'go']));
    });
});
