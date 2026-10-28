import { emojiCodepoints } from '@gitbook/emoji-codepoints';

/**
 * Returns the emoji character for the given emoji code.
 */
export function getEmojiForCode(code: string): string {
    if (!code) {
        return '';
    }

    code = code.toLowerCase();

    const fullCode =
        // use hasOwn to prevent codes like "constructor" or "prototype" from being resolved to the emoji codepoints object prototype
        (Object.hasOwn(emojiCodepoints, code) ? emojiCodepoints[code] : undefined) ?? code;
    const codePoints = fullCode.split('-').map((elt) => Number.parseInt(elt, 16));

    try {
        return String.fromCodePoint(...codePoints);
    } catch {
        return '';
    }
}
