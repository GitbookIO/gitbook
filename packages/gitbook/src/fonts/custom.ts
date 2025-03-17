import type { CustomizationDefaultFont } from '@gitbook/api';
import { fonts } from './default';

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
 * Define the custom font faces and set the --font-content to the custom font name
 */
export function generateFontFacesCSS(customFont: CustomizationFontDefinition): string {
    const { fontFaces } = customFont;

    // Generate font face declarations for all weights
    const fontFaceDeclarations = fontFaces
        .map((face) => {
            const srcAttr = face.sources
                .map((source) => {
                    let srcDefinition = `url(${source.url})`;

                    if (source.format) {
                        srcDefinition += ` format('${source.format}')`;
                    }

                    return srcDefinition;
                })
                .join(', ');

            // We could use the font-family name here, but to avoid extra normalization we're using CustomFont
            return `
        @font-face {
            font-family: CustomFont; 
            font-style: normal;
            font-weight: ${face.weight};
            font-display: swap;
            src: ${srcAttr};
        }
        `;
        })
        .join('\n');

    return `
        ${fontFaceDeclarations}
        :root {
            --font-custom: CustomFont;
        }
    `;
}

/**
 * Get the list of font sources to preload
 */
export function getFontSourcesToPreload(customFont: CustomizationFontDefinition): FontSource[] {
    const allSources = customFont.fontFaces.flatMap((face) => face.sources);

    const uniqueSources = new Map<string, FontSource>();

    // Add each source to the map, using URL as the key
    allSources.forEach((source) => {
        const url = source.url.toString();
        if (!uniqueSources.has(url)) {
            uniqueSources.set(url, source);
        }
    });

    return Array.from(uniqueSources.values());
}

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
    cssDefinitions: string;
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

    // Custom font with @font-face definitions
    return {
        type: 'custom',
        cssDefinitions: generateFontFacesCSS(font),
        preloadSources: getFontSourcesToPreload(font),
    };
}
