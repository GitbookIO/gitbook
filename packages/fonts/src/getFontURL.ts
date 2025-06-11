import type { CustomizationDefaultFont } from '@gitbook/api';
import { fonts } from './fonts';
import type { FontWeight } from './types';

/**
 * Get the URL to load a font for a text.
 */
export function getFontURL(input: {
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
}): string | null {
    if (!input.text.trim()) {
        return null;
    }

    const fontDefinition = fonts[input.font];
    if (!fontDefinition) {
        return null;
    }

    const variant = fontDefinition.variants[input.weight];
    if (!variant) {
        return null;
    }

    const script = Object.keys(fontDefinition.unicodeRange).find((script) =>
        [...input.text].every((ch) => {
            const code = ch.codePointAt(0);
            if (code === undefined) {
                return false;
            }
            const isIn = inRange(code, fontDefinition.unicodeRange[script]);
            console.log(ch, code, isIn);

            return isIn;
        })
    );
    console.log(Object.keys(fontDefinition.unicodeRange), script);

    if (!script) {
        return null;
    }

    return variant[script] ?? null;
}

/**
 * Does this code point fall inside the unicode-range string?
 *
 * The `rangeStr` may contain:
 *   • Single code points   → "U+0131"
 *   • Ranges               → "U+0000-00FF"
 *   • Several items        → "U+0020-007F, U+00A0"
 *   • Mixed upper/lower-case, extra whitespace, optional "0x" prefix
 */
export function inRange(codePoint: number, rangeStr: string): boolean {
    return rangeStr
        .split(',') // multiple segments
        .some((raw) => {
            const seg = raw.trim().toUpperCase();
            if (!seg.startsWith('U+')) return false;

            const body = seg.slice(2); // strip "U+"
            // Wildcards like "U+4??" aren’t emitted by Google’s CSS API,
            // but this covers them for completeness:
            if (body.includes('?')) {
                const re = new RegExp(`^${body.replace(/\?/g, '[0-9A-F]')}$`);
                return re.test(codePoint.toString(16).toUpperCase());
            }

            // Normal single value  → U+0131
            if (!body.includes('-')) {
                return codePoint === Number.parseInt(body, 16);
            }

            // Range  → U+0000-00FF
            const [startHex, endHex] = body.split('-');
            const start = Number.parseInt(startHex, 16);
            const end = Number.parseInt(endHex, 16);
            return codePoint >= start && codePoint <= end;
        });
}
