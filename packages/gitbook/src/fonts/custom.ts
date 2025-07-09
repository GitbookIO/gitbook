import type { CustomizationFontDefinitionInput } from '@gitbook/api';

/**
 * Define the custom font faces and set the --font-content or --font-mono variable
 * to the custom font name.
 */
export function generateFontFacesCSS(
    customFont: CustomizationFontDefinitionInput,
    type: 'content' | 'mono'
): string {
    const { fontFaces } = customFont;
    const fontFamilyName = `CustomFont_${type}`;
    const fontVariableName = `--font-${type}`;
    const fallbackFont = type === 'content' ? 'sans-serif' : 'monospace';

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
            font-family: ${fontFamilyName};
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
            ${fontVariableName}: ${fontFamilyName}, ${fallbackFont};
        }`
        : '';
}

/**
 * Get a list of font sources to preload (only 400 and 700 weights)
 */
export function getFontSourcesToPreload(customFont: CustomizationFontDefinitionInput) {
    return customFont.fontFaces.filter(
        (face): face is typeof face & { weight: 400 | 700 } =>
            face.weight === 400 || face.weight === 700
    );
}
