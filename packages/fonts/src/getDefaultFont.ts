import type { CustomizationDefaultFont } from '@gitbook/api';
import { fonts } from './fonts';
import type { FontWeight } from './types';

/**
 * Get the URL to load a font for a text.
 */
export function getDefaultFont(input: {
    /**
     * GitBook font to use.
     */
    font: CustomizationDefaultFont;

    /**
     * Text to display with the font.
     */
    text: string;

    /**
     * Font weight to use.
     */
    weight: FontWeight;
}): { font: string; url: string } | null {
    if (!input.text.trim()) {
        return null;
    }

    const fontDefinition = fonts[input.font];
    if (!fontDefinition) {
        return null;
    }

    const variant = fontDefinition.variants[`${input.weight}`];
    if (!variant) {
        return null;
    }

    const script = getBestUnicodeRange(input.text, fontDefinition.unicodeRange);
    if (!script) {
        return null;
    }

    return variant[script]
        ? {
              font: input.font,
              url: variant[script],
          }
        : null;
}

/**
 * Determine which named @font-face unicode-range covers
 * the greatest share of the characters in `text`.
 *
 * @param text   The text you want to inspect.
 * @param ranges An object whose keys are range names and whose
 *               values are CSS-style comma-separated unicode-range
 *               declarations (e.g. "U+0370-03FF,U+1F00-1FFF").
 * @returns      The key of the best-matching range, or `null`
 *               when nothing matches at all.
 */
function getBestUnicodeRange(text: string, ranges: Record<string, string>): string | null {
    // ---------- helper: parse "U+XXXX" or "U+XXXX-YYYY" ----------
    const parseOne = (token: string): [number, number] | null => {
        token = token.trim().toUpperCase();
        if (!token.startsWith('U+')) return null;

        const body = token.slice(2); // drop "U+"
        const [startHex, endHex] = body.split('-');
        const start = Number.parseInt(startHex!, 16);
        const end = endHex ? Number.parseInt(endHex, 16) : start;

        if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
        return [start, end];
    };

    // ---------- helper: build lookup table ----------
    const parsed: Record<string, [number, number][]> = {};
    for (const [label, list] of Object.entries(ranges)) {
        parsed[label] = list
            .split(',')
            .map(parseOne)
            .filter((x): x is [number, number] => x !== null);
    }

    // ---------- tally code-point hits ----------
    const hits: Record<string, number> = Object.fromEntries(Object.keys(parsed).map((k) => [k, 0]));

    for (let i = 0; i < text.length; ) {
        const cp = text.codePointAt(i)!;
        i += cp > 0xffff ? 2 : 1; // advance by 1 UTF-16 code-unit (or 2 for surrogates)

        for (const [label, rangesArr] of Object.entries(parsed)) {
            if (rangesArr.some(([lo, hi]) => cp >= lo && cp <= hi)) {
                hits[label]!++;
            }
        }
    }

    // ---------- choose the "best" ----------
    let winner: string | null = null;
    let maxCount = 0;

    for (const [label, count] of Object.entries(hits)) {
        if (count > maxCount) {
            maxCount = count;
            winner = label;
        }
    }

    return maxCount > 0 ? winner : null;
}
