import { CustomizationDefaultMonospaceFont } from '@gitbook/api';

import { EMOJI_FONT, type FontName } from './definitions';
import faces from './generated/faces.json';
import type { FontFacesData, FontFamilyData, FontRole } from './types';
import { getAssetURL } from '@/lib/assets';

const fontFaces = faces as FontFacesData;

// The rules only vary by font and the variable they bind, and every page renders a few dozen.
const cache = new Map<string, string>();

/** Used until the cache has warmed up for sites saved before the setting existed. */
export const DEFAULT_MONOSPACE_FONT = CustomizationDefaultMonospaceFont.IBMPlexMono;

// Emitted per picked family and inlined in the head, so a page never carries the other 20 families
// the way a shared `next/font` stylesheet did.
export function generateDefaultFontFacesCSS(font: FontName, role?: FontRole): string {
    const key = role ? `${font}:${role}` : font;
    const cached = cache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    const family = fontFaces[font];
    if (!family) {
        throw new Error(`Missing generated font faces for ${font}`);
    }

    const css = [
        ...family.variants.flatMap((variant) =>
            variant.files.map((file, subset) =>
                generateFace(family, variant.weight, variant.style, file, family.subsets[subset])
            )
        ),
        generateFallbackFace(family),
        `:root { ${role ? `--font-${role}` : family.variable}: ${family.fontFamilyValue}; }`,
    ]
        .filter(Boolean)
        .join('\n');

    cache.set(key, css);
    return css;
}

export function generateEmojiFontFacesCSS(): string {
    return generateDefaultFontFacesCSS(EMOJI_FONT);
}

function generateFace(
    family: FontFamilyData,
    weight: string,
    style: string,
    file: string,
    unicodeRange: string | undefined
): string {
    return `@font-face {
    font-family: "${family.family}";
    font-style: ${style};
    font-weight: ${weight};
    font-display: swap;${family.ascentOverride ? `\n    ascent-override: ${family.ascentOverride};` : ''}
    src: url(${getAssetURL(`fonts/${file}`)}) format("woff2");${
        unicodeRange ? `\n    unicode-range: ${unicodeRange};` : ''
    }
}`;
}

// A `local()` face with the real font's metrics: the page keeps the system font's glyphs but the
// picked font's proportions, so swapping it in barely shifts the layout.
function generateFallbackFace(family: FontFamilyData): string {
    const fallback = family.fallbackFace;
    if (!fallback) {
        return '';
    }

    return `@font-face {
    font-family: "${fallback.family}";
    src: local("${fallback.local}");
    ascent-override: ${fallback.ascentOverride};
    descent-override: ${fallback.descentOverride};
    line-gap-override: ${fallback.lineGapOverride};
    size-adjust: ${fallback.sizeAdjust};
}`;
}
