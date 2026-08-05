import { describe, expect, it } from 'bun:test';
import { SLUG_MAX_CODE_POINTS, slugifySelectValue } from './slug';

describe('slugifySelectValue', () => {
    // This table IS the slug contract — see SLUG_ALGO_VERSION. Changing any expectation here orphans
    // selections already persisted in visitors' localStorage.
    const cases: Array<[input: string, expected: string]> = [
        ['Python', 'python'],
        ['JavaScript', 'javascript'],
        ['JS', 'js'], // note: does NOT equal "javascript" — the near-duplicate lint case
        // Technical symbols in the safelist keep otherwise-colliding names distinct.
        ['C', 'c'],
        ['C++', 'c++'],
        ['C#', 'c#'],
        ['.NET', '.net'],
        ['Node.js', 'node.js'],
        ['on_prem', 'on_prem'],
        // Letters/numbers/marks from every script survive.
        ['café', 'café'],
        ['naïve', 'naïve'],
        ['安装', '安装'],
        ['日本語', '日本語'],
        ['Ελληνικά', 'ελληνικά'],
        // Whitespace and other symbols collapse to single dashes and trim.
        ['  npm  ', 'npm'],
        ['Two   Words', 'two-words'],
        ['on-prem', 'on-prem'],
        ['On-Prem', 'on-prem'],
        ['🚀 Launch', 'launch'],
        ['', ''],
        ['---', ''],
        ['🚀', ''],
    ];

    for (const [input, expected] of cases) {
        it(`${JSON.stringify(input)} → ${JSON.stringify(expected)}`, () => {
            expect(slugifySelectValue(input)).toBe(expected);
        });
    }

    it('drops control/format characters instead of turning them into dashes', () => {
        const zeroWidthSpace = String.fromCodePoint(0x200b);
        const nul = String.fromCodePoint(0);
        expect(slugifySelectValue(`a${zeroWidthSpace}b`)).toBe('ab');
        expect(slugifySelectValue(`a${nul}b`)).toBe('ab');
    });

    it('never produces the reserved comma delimiter', () => {
        expect(slugifySelectValue('a, b, c')).not.toContain(',');
    });

    describe('length cap', () => {
        it('caps to SLUG_MAX_CODE_POINTS code points', () => {
            expect(slugifySelectValue('a'.repeat(200))).toHaveLength(SLUG_MAX_CODE_POINTS);
        });

        it('counts code points, not UTF-16 units, so astral chars are not cut in half', () => {
            const astral = '𠀀'; // U+20000, a CJK Extension B ideograph = one surrogate pair
            const result = slugifySelectValue(astral.repeat(200));
            expect([...result]).toHaveLength(SLUG_MAX_CODE_POINTS);
            expect(result).toBe(astral.repeat(SLUG_MAX_CODE_POINTS));
        });
    });

    it('is idempotent', () => {
        for (const [input] of cases) {
            const once = slugifySelectValue(input);
            expect(slugifySelectValue(once)).toBe(once);
        }
    });
});
