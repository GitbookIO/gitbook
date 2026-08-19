import { describe, expect, it } from 'bun:test';

import { emojiSequences } from '@gitbook/emoji-codepoints';

import { getEmojiForCode } from './emojis';

describe('getEmojiForCode', () => {
    it('resolves every base sequence to its fully-qualified emoji', () => {
        for (const sequence of emojiSequences.split('\n')) {
            const base = sequence
                .split('-')
                .filter((part) => part !== 'fe0f' && part !== '200d')
                .join('-');
            const expected = String.fromCodePoint(
                ...sequence.split('-').map((part) => Number.parseInt(part, 16))
            );
            expect(getEmojiForCode(base)).toBe(expected);
        }
    });

    it('passes through codes that need no qualification', () => {
        expect(getEmojiForCode('1f600')).toBe('😀');
        expect(getEmojiForCode('1F600')).toBe('😀');
    });

    it('handles empty and invalid codes', () => {
        expect(getEmojiForCode('')).toBe('');
        expect(getEmojiForCode('not-a-code')).toBe('');
    });

    it('never resolves Object prototype keys through the index', () => {
        // `constructor` parses as the hex number 0xc, so it falls through to the raw-codepoint
        // path exactly as before — what matters is that it resolves no emoji.
        expect(getEmojiForCode('constructor')).toBe('\f');
        expect(getEmojiForCode('prototype')).toBe('');
        expect(getEmojiForCode('toString')).toBe('');
    });
});
