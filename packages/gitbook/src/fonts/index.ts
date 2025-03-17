import type { CustomizationDefaultFont } from '@gitbook/api';
import { generateFontFacesCSS, getFontSourcesToPreload } from './custom';
import { fonts } from './default';

export * from './default';
export * from './custom';

/**
 * The human-readable font-family name used in CSS (e.g., "Open Sans", "Playfair Display").
 * @minLength 1
 * @maxLength 50
 */
export type FontFamily = string;

/**
 * Numeric representation of the font weight (400=regular, 500=medium, 700=bold, 900=black).
 * @min 1
 * @max 1000
 */
export type FontWeight = number;

/** A font file referenced within a font-face declaration, specifying the file's location and format. */
export interface FontSource {
    /** The absolute or relative URL pointing to the font file. */
    url: string;
    /** The format of the font file. Prefer 'woff2' for modern browsers. */
    format?: 'woff2' | 'woff';
}

/** A single font-face declaration specifying the weight and source files for a particular variation of the font. */
export interface FontFace {
    /** Numeric representation of the font weight (400=regular, 500=medium, 700=bold, 900=black). */
    weight: FontWeight;
    /**
     * Font source files provided in supported formats (e.g., woff2, woff).
     * @minItems 1
     */
    sources: FontSource[];
}

/** Defines a font family along with its various font-face declarations for use in CSS '@font-face' rules. */
export interface CustomizationFontDefinition {
    /** A globally unique identifier for the font definition. */
    id: string;
    /** The human-readable font-family name used in CSS (e.g., "Open Sans", "Playfair Display"). */
    fontFamily: FontFamily;
    /**
     * A list of font-face definitions, specifying variations such as weight and style.
     * @minItems 1
     */
    fontFaces: FontFace[];
}

/**
 * The path of the file in the storage bucket
 * @minLength 1
 * @maxLength 512
 */
export type StorageFileKey = string;

export type CustomizationFont = CustomizationDefaultFont | CustomizationFontDefinition;
/**
 * Represents font data for either a default font or a custom font
 */
type FontData = DefaultFontData | CustomFontData;

/**
 * Font data for a default font from next/font
 */
interface DefaultFontData {
    type: 'default';
    variable: string;
}

/**
 * Font data for a custom font with @font-face definitions
 */
interface CustomFontData {
    type: 'custom';
    fontFaceRules: string;
    preloadSources: FontSource[];
}

/**
 * Get the appropriate font data for a given font configuration
 */
export function getFontData(font: CustomizationFont): FontData {
    if (typeof font === 'string') {
        // Default font from next/font
        return {
            type: 'default',
            variable: fonts[font].variable,
        };
    }

    // Custom font with @font-face rules
    return {
        type: 'custom',
        fontFaceRules: generateFontFacesCSS(font),
        preloadSources: getFontSourcesToPreload(font),
    };
}
