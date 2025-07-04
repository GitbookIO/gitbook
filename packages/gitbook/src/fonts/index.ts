import type {
    CustomizationFont,
    CustomizationFontDefinition,
    CustomizationMonospaceFont,
} from '@gitbook/api';
import { generateFontFacesCSS, getFontSourcesToPreload } from './custom';
import { fonts } from './default';

/**
 * Represents font data for either a default font or a custom font
 */
export type FontData = DefaultFontData | CustomFontData;

/**
 * Font data for a default font, currently handle with next/font
 */
interface DefaultFontData {
    type: 'default';
    variable: string;
}

/**
 * Font data for a custom font with @font-face rules
 */
interface CustomFontData {
    type: 'custom';
    fontFaceRules: string;
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
            variable: fonts[font].variable,
        };
    }

    return {
        type: 'custom',
        fontFaceRules: generateFontFacesCSS(font, type),
        preloadSources: getFontSourcesToPreload(font),
    };
}
