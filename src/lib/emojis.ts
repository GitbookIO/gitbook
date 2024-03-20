import { emojiCodepoints } from '@gitbook/emoji-codepoints';

/**
 * Returns the emoji character for the given emoji code.
 */
export function getEmojiForCode(code: string): string {
    if (!code) {
        return '';
    }

    code = code.toLowerCase();
    const fullCode = emojiCodepoints[code] ?? code;

    const codePoints = fullCode.split('-').map((elt) => parseInt(elt, 16));

    try {
        return String.fromCodePoint(...codePoints);
    } catch {
        return '';
    }
}
