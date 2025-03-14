import { CustomizationDefaultFont } from '@gitbook/api';

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
    url: URL;
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
                    let srcDefinition = `url(${source.url.href})`;

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
 * Define the custom font faces and set the --font-content to the custom font name
 */
// function generateCustomFontFaces(customFont: CustomizationFontDefinition): string {
//     const { fontFamily, faces } = customFont;
//
//     const regularFont = faces.find((face) => face.weight === 400);
//     const boldFont = faces.find((face) => face.weight === 700);
//
//     if (!regularFont || !boldFont) {
//         throw new Error('Custom font must have a regular and a bold face');
//     }
//
//     const regular = `
//         @font-face {
//             font-family: ${fontFamily};
//             font-style: normal;
//             font-weight: ${regularFont.weight};
//             font-display: swap;
//             src: url(${regularFont.url});
//         }
// `;
//
//     // const semiBold = `
//     //        @font-face {
//     //            font-family: ${fontFamily};
//     //            font-style: normal;
//     //            font-weight: 600;
//     //            font-display: swap;
//     //            src: url(${boldFont.url});
//     //        }
//     //    `
//     // 	: "";
//
//     const bold = `
//         @font-face {
//             font-family: ${fontFamily};
//             font-style: normal;
//             font-weight: ${boldFont.weight};
//             font-display: swap;
//             src: url(${boldFont.url});
//         }
//     `;
//
//     return `
//         ${regular}
//         ${bold}
//         :root {
//             --font-content: ${fontFamily};
//         }
//     `;
// }
