import { describe, expect, it } from 'bun:test';

import { getEmojiForCode } from './emojis';

describe('getEmojiForCode', () => {
    it('should return the emoji character for the given emoji code', () => {
        expect(getEmojiForCode('1f600')).toBe('😀');
    });

    it('should handle complex codes', () => {
        expect(getEmojiForCode('1f935-2642')).toEqual('🤵‍♂️');
    });

    it('should return an empty string if invalid', () => {
        expect(getEmojiForCode('invalid')).toEqual('');
    });

    it('should handle one with uppercase chars', () => {
        expect(getEmojiForCode('1f4A5')).toEqual('💥');
    });
});
