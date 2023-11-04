/**
 * Returns the emoji character for the given emoji code.
 */
export function getEmojiForCode(code: string): string {
    if (!code) {
        return '';
    }

    const codePoints = code.split('-').map((elt) => parseInt(elt, 16));
    return String.fromCodePoint(...codePoints);
}
