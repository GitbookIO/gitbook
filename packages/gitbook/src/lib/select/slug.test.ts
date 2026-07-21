import { describe, expect, it } from 'bun:test';
import { slugifySelectValue } from './slug';

describe('slugifySelectValue', () => {
    // This table IS the frozen public contract for `?select=` URLs — see SLUG_ALGO_VERSION.
    // Changing any expectation here is a breaking change to already-shared links.
    const cases: Array<[input: string, expected: string]> = [
        ['Python', 'python'],
        ['JavaScript', 'javascript'],
        ['JS', 'js'], // note: does NOT equal "javascript" — the near-duplicate lint case
        ['  npm  ', 'npm'], // leading/trailing whitespace trimmed
        ['Two   Words', 'two-words'], // internal whitespace runs collapse to one dash
        ['on-prem', 'on-prem'], // existing dashes preserved
        ['On-Prem', 'on-prem'], // case folded
        ['Node.js', 'node-js'], // punctuation becomes a separator
        ['C++', 'c'], // trailing separators trimmed
        ['C#', 'c'],
        ['.NET', 'net'], // leading separators trimmed
        ['a_b', 'a-b'], // underscore is not [a-z0-9]
        ['🚀 Launch', 'launch'], // emoji stripped
        ['café', 'caf'], // non-ascii letters are dropped (frozen v1 behaviour)
        ['安装', ''], // purely non-latin reduces to empty → "no slug"
        ['', ''],
        ['---', ''],
    ];

    for (const [input, expected] of cases) {
        it(`${JSON.stringify(input)} → ${JSON.stringify(expected)}`, () => {
            expect(slugifySelectValue(input)).toBe(expected);
        });
    }

    it('is idempotent', () => {
        for (const [input] of cases) {
            const once = slugifySelectValue(input);
            expect(slugifySelectValue(once)).toBe(once);
        }
    });
});
