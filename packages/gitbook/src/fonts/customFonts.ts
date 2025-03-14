import type { CustomizationDefaultFont } from '@gitbook/api';
import { fonts } from './index';

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
    const { fontFamily, fontFaces } = customFont;

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

            return `
        @font-face {
            font-family: ${fontFamily};
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
            --font-content: ${fontFamily};
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
 * The font data for a custom font
 * fontCSS is the @font-face CSS definitions
 * preloadSources is the list of font files to preload
 */
type CustomFontData = {
    cssClass: 'font-content';
    cssDefinitions: string;
    preloadSources: FontSource[];
};

type DefaultFontData = {
    cssClass: string;
    cssDefinitons: undefined;
    preloadSources: undefined;
};

/**
 * Get the font data for a given font
 * For default fonts it returns a next/font variable name.
 * For custom fonts it returns the CSS for the @font-face definitions and font URLs to preload
 */
export function getFontData(font: CustomizationFont): CustomFontData | DefaultFontData {
    if (typeof font === 'string') {
        return {
            // next/font variable name
            cssClass: fonts[font].variable,
            cssDefinitons: undefined,
            preloadSources: undefined,
        };
    }

    return {
        // custom font variable name defined in tailwind.config.js
        cssClass: 'font-content',
        cssDefinitions: generateFontFacesCSS(font),
        preloadSources: getFontSourcesToPreload(font),
    };
}
