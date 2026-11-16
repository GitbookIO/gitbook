import { describe, expect, it } from 'bun:test';

import { cx } from './classnames';

describe('cx', () => {
    it('joins strings and skips falsy values', () => {
        expect(cx('a', null, undefined, false, 0 as never, '', 'b')).toBe('a b');
    });

    it('flattens nested arrays', () => {
        expect(cx(['a', ['b', null, ['c']]], 'd')).toBe('a b c d');
    });

    it('returns an empty string without values', () => {
        expect(cx()).toBe('');
        expect(cx([], null)).toBe('');
    });
});
