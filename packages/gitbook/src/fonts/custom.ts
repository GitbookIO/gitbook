import type { CustomizationFontDefinition, FontSource } from '@gitbook/api';

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

    return fontFaceDeclarations
        ? `${fontFaceDeclarations}
        :root {
            --font-custom: CustomFont;
        }`
        : '';
}

/**
 * Get the list of font sources to preload
 *
 * Currently we're preloading all sources but we could optimize this in the future by only preloading the important ones
 * to avoid blocking the page load.
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
