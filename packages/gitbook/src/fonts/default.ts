import { CustomizationDefaultMonospaceFont } from '@gitbook/api';

import { EMOJI_FONT, type FontName } from './definitions';
import faces from './generated/faces.json';
import type { FontFaceData, FontFacesData, FontFamilyData } from './types';
import { getAssetURL } from '@/lib/assets';

const fontFaces = faces as FontFacesData;

// The rules only vary by font, and every page renders a few dozen of them.
const cache = new Map<FontName, string>();

/** Used until the cache has warmed up for sites saved before the setting existed. */
export const DEFAULT_MONOSPACE_FONT = CustomizationDefaultMonospaceFont.IBMPlexMono;

// Emitted per picked family and inlined in the head, so a page never carries the other 20 families
// the way a shared `next/font` stylesheet did.
export function generateDefaultFontFacesCSS(font: FontName): string {
    const cached = cache.get(font);
    if (cached !== undefined) {
        return cached;
    }

    const family = fontFaces[font];
    if (!family) {
        throw new Error(`Missing generated font faces for ${font}`);
    }

    const css = [
        ...family.faces.map((face) => generateFace(family, face)),
        generateFallbackFace(family),
        `:root { ${family.variable}: ${family.fontFamilyValue}; }`,
    ]
        .filter(Boolean)
        .join('\n');

    cache.set(font, css);
    return css;
}

export function generateEmojiFontFacesCSS(): string {
    return generateDefaultFontFacesCSS(EMOJI_FONT);
}

function generateFace(family: FontFamilyData, face: FontFaceData): string {
    return `@font-face {
    font-family: "${family.family}";
    font-style: ${face.style};
    font-weight: ${face.weight};
    font-display: swap;${face.ascentOverride ? `\n    ascent-override: ${face.ascentOverride};` : ''}
    src: url(${getAssetURL(`fonts/${face.file}`)}) format("woff2");${
        face.unicodeRange ? `\n    unicode-range: ${face.unicodeRange};` : ''
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
