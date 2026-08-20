import type {
    CustomizationFont,
    CustomizationFontDefinition,
    CustomizationMonospaceFont,
} from '@gitbook/api';

import { generateFontFacesCSS, getFontSourcesToPreload } from './custom';
import { generateDefaultFontFacesCSS } from './default';

export { DEFAULT_MONOSPACE_FONT, generateEmojiFontFacesCSS } from './default';

/**
 * Represents font data for either a default font or a custom font
 */
export type FontData = DefaultFontData | CustomFontData;

interface BaseFontData {
    /** `@font-face` rules and the CSS variable, to inline in the document head. */
    fontFaceRules: string;
}

/**
 * Font data for a default font, self-hosted from our own assets
 */
interface DefaultFontData extends BaseFontData {
    type: 'default';
}

/**
 * Font data for a custom font with @font-face rules
 */
interface CustomFontData extends BaseFontData {
    type: 'custom';
    preloadSources: CustomizationFontDefinition['fontFaces'];
}

/**
 * Get the appropriate font data for a given font configuration
 */
export function getFontData(
    font: CustomizationFont | CustomizationMonospaceFont,
    type: 'content' | 'mono'
): FontData {
    if (typeof font === 'string') {
        return {
            type: 'default',
            fontFaceRules: generateDefaultFontFacesCSS(font),
        };
    }

    return {
        type: 'custom',
        fontFaceRules: generateFontFacesCSS(font, type),
        preloadSources: getFontSourcesToPreload(font),
    };
}
