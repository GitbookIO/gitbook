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

    it('keeps the safelisted symbols usable in attribute selectors', () => {
        // `+` and `#` are valid inside a quoted attribute value; they must appear verbatim.
        const css = generateSelectCSS(['c++', 'c#']);
        expect(css).toContain('[data-select-option="c++"]');
        expect(css).toContain('[data-select-option="c#"]');
    });

    it('escapes CSS-string metacharacters so a widened charset stays well-formed', () => {
        // slugifySelectValue can't produce these today; this guards future widening.
        const css = generateSelectCSS(['a"b', 'c\\d']);
        expect(css).toContain('[data-select-option="a\\"b"]');
        expect(css).toContain('[data-select-option="c\\\\d"]');
        // The raw, unescaped quote must never leak into the stylesheet.
        expect(css).not.toContain('="a"b"');
    });
});
