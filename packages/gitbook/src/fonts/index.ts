import type {
    CustomizationFont,
    CustomizationFontDefinition,
    CustomizationMonospaceFont,
} from '@gitbook/api';

import { generateFontFacesCSS, getFontSourcesToPreload } from './custom';
import { generateDefaultFontFacesCSS } from './default';
import type { FontRole } from './types';

export { DEFAULT_MONOSPACE_FONT, generateEmojiFontFacesCSS } from './default';
export type { FontRole } from './types';
export { getHeadingFont } from './heading';

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
    type: FontRole
): FontData {
    if (typeof font === 'string') {
        return {
            type: 'default',
            // The heading font shares the default families with the content font, so it has to bind
            // the family to `--font-heading` rather than the family's own variable.
            fontFaceRules: generateDefaultFontFacesCSS(font, type === 'heading' ? type : undefined),
        };
    }

    return {
        type: 'custom',
        fontFaceRules: generateFontFacesCSS(font, type),
        preloadSources: getFontSourcesToPreload(font),
    };
}
