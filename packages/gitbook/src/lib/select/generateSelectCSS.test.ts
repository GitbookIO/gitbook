import { describe, expect, it } from 'bun:test';
import { SELECT_LIST_CAP } from './constants';
import { generateSelectCSS, selectSetClassName } from './generateSelectCSS';

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

    const slugs = ['python', 'go'];
    const scope = `.${selectSetClassName(slugs)}`;
    const css = generateSelectCSS(slugs);

    it('hides all options by default', () => {
        expect(css).toContain(`${scope} [data-select-option]{display:none}`);
    });

    it('reveals a rank-0 winner with no earlier-rank negations', () => {
        expect(css).toContain(
            `html[data-sel-0="python"] ${scope} [data-select-option="python"]{display:block}`
        );
    });

    it('gates a rank-1 winner behind every option being absent at rank 0', () => {
        expect(css).toContain(
            `html:not([data-sel-0="python"]):not([data-sel-0="go"])[data-sel-1="python"] ${scope} [data-select-option="python"]{display:block}`
        );
    });

    it('shows the default pane only when no option appears in the whole ladder', () => {
        expect(css).toContain(`:not([data-sel-${SELECT_LIST_CAP - 1}="go"])`);
        expect(css).toContain(`${scope} [data-select-default]{display:block}`);
    });

    it('emits one winner rule per option per rank, plus base + default', () => {
        const shown = css.match(/\{display:block\}/g) ?? [];
        const hidden = css.match(/\{display:none\}/g) ?? [];
        expect(shown).toHaveLength(slugs.length * SELECT_LIST_CAP + 1); // winners + default
        expect(hidden).toHaveLength(1); // base hide
    });
});
