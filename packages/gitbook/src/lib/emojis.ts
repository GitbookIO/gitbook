import { emojiSequences } from '@gitbook/emoji-codepoints';

/**
 * Base form of a codepoint sequence: the qualified one without its variation selectors and joiners.
 */
function getBaseSequence(sequence: string): string {
    return sequence
        .split('-')
        .filter((part) => part !== 'fe0f' && part !== '200d')
        .join('-');
}

let qualifiedByBase: Map<string, string> | null = null;

// The index is ~1700 entries; building it on first use keeps it off the critical path for the many
// pages that render no emoji at all.
function getQualifiedByBase(): Map<string, string> {
    if (!qualifiedByBase) {
        qualifiedByBase = new Map(
            emojiSequences.split('\n').map((sequence) => [getBaseSequence(sequence), sequence])
        );
    }
    return qualifiedByBase;
}

/**
 * Returns the emoji character for the given emoji code.
 */
export function getEmojiForCode(code: string): string {
    if (!code) {
        return '';
    }

    code = code.toLowerCase();

    const fullCode = getQualifiedByBase().get(code) ?? code;
    const codePoints = fullCode.split('-').map((elt) => Number.parseInt(elt, 16));

    try {
        return String.fromCodePoint(...codePoints);
    } catch {
        return '';
    }
}
