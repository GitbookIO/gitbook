import type { CustomizationFontDefinition } from '@gitbook/api';

/**
 * Define the custom font faces and set the --font-custom to the custom font name
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

            // We could use the customFont.fontFamily name here, but to avoid extra normalization we're using 'CustomFont'
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
 * Get a list of font sources to preload (only 400 and 700 weights)
 */
export function getFontSourcesToPreload(customFont: CustomizationFontDefinition) {
    return customFont.fontFaces.filter(
        (face): face is typeof face & { weight: 400 | 700 } =>
            face.weight === 400 || face.weight === 700
    );
}
