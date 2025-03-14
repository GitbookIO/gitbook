import { describe, test, expect } from 'bun:test';
import { type CustomizationFontDefinition, generateFontFacesCSS } from './customFonts';
import stylelint from 'stylelint';

// Helper function to validate CSS with stylelint
async function isCSSValid(css: string): Promise<boolean> {
    try {
        const stylelintResult = await stylelint.lint({
            code: css,
            config: {
                rules: {
                    'at-rule-no-unknown': true,
                    'declaration-block-no-duplicate-properties': true,
                    'property-no-unknown': true,
                    'selector-pseudo-class-no-unknown': true,
                    'selector-pseudo-element-no-unknown': true,
                    'no-duplicate-selectors': true,
                    'no-empty-source': true,
                    'no-invalid-double-slash-comments': true,
                },
            },
        });

        return !stylelintResult.errored;
    } catch (error) {
        console.error('Error while linting CSS:', error);
        return false;
    }
}

describe('generateFontFacesCSS', () => {
    test('basic case with regular and bold weights', async () => {
        const fontDef: CustomizationFontDefinition = {
            id: 'open-sans',
            fontFamily: 'Open Sans',
            fontFaces: [
                {
                    weight: 400,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/opensans-regular.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
                {
                    weight: 700,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/opensans-bold.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
            ],
        };

        const css = generateFontFacesCSS(fontDef);

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain('font-weight: 400');
        expect(css).toContain('font-weight: 700');
        expect(css).toContain(
            "url(https://example.com/fonts/opensans-regular.woff2) format('woff2')"
        );
        expect(css).toContain("url(https://example.com/fonts/opensans-bold.woff2) format('woff2')");
        expect(css).toContain('--font-content: Open Sans');
    });

    test('should fail validation on broken CSS', async () => {
        // Create a broken CSS string
        const brokenCss = `
      @font-face {
        font-family: "Broken Font"
        /* Missing semicolon above */
        font-weight: 400;
        src: url(broken);
      }
    `;

        // This should fail syntax validation
        const isValid = await isCSSValid(brokenCss);
        expect(isValid).toBe(false);
    });

    test('multiple font weights', async () => {
        const fontDef: CustomizationFontDefinition = {
            id: 'roboto',
            fontFamily: 'Roboto',
            fontFaces: [
                {
                    weight: 300,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/roboto-light.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
                {
                    weight: 400,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/roboto-regular.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
                {
                    weight: 500,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/roboto-medium.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
                {
                    weight: 700,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/roboto-bold.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
                {
                    weight: 900,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/roboto-black.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
            ],
        };

        const css = generateFontFacesCSS(fontDef);

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        [300, 400, 500, 700, 900].forEach((weight) => {
            expect(css).toContain(`font-weight: ${weight}`);
        });
    });

    test('multiple sources for a single weight', async () => {
        const fontDef: CustomizationFontDefinition = {
            id: 'lato',
            fontFamily: 'Lato',
            fontFaces: [
                {
                    weight: 400,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/lato-regular.woff2'),
                            format: 'woff2',
                        },
                        {
                            url: new URL('https://example.com/fonts/lato-regular.woff'),
                            format: 'woff',
                        },
                    ],
                },
            ],
        };

        const css = generateFontFacesCSS(fontDef);

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain(
            "url(https://example.com/fonts/lato-regular.woff2) format('woff2'), url(https://example.com/fonts/lato-regular.woff) format('woff')"
        );
    });

    test('missing format property', async () => {
        const fontDef: CustomizationFontDefinition = {
            id: 'source-sans',
            fontFamily: 'Source Sans Pro',
            fontFaces: [
                {
                    weight: 400,
                    sources: [
                        { url: new URL('https://example.com/fonts/sourcesans-regular.woff2') },
                        {
                            url: new URL('https://example.com/fonts/sourcesans-regular.woff'),
                            format: 'woff',
                        },
                    ],
                },
            ],
        };

        const css = generateFontFacesCSS(fontDef);

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain(
            "url(https://example.com/fonts/sourcesans-regular.woff2), url(https://example.com/fonts/sourcesans-regular.woff) format('woff')"
        );
    });

    test('empty font faces array', async () => {
        const fontDef: CustomizationFontDefinition = {
            id: 'empty-font',
            fontFamily: 'Empty Font',
            fontFaces: [],
        };

        const css = generateFontFacesCSS(fontDef);

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        // Should only contain the CSS variable, no @font-face declarations
        expect(css).not.toContain('@font-face');
        expect(css).toContain('--font-content: Empty Font');
    });

    test('font with special characters in name', async () => {
        const fontDef: CustomizationFontDefinition = {
            id: 'special-font',
            fontFamily: 'Special Font & Co.',
            fontFaces: [
                {
                    weight: 400,
                    sources: [
                        {
                            url: new URL('https://example.com/fonts/special.woff2'),
                            format: 'woff2',
                        },
                    ],
                },
            ],
        };

        const css = generateFontFacesCSS(fontDef);

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);
    });
});
