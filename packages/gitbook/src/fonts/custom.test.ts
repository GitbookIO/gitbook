import { describe, expect, test } from 'bun:test';
import type { CustomizationFontDefinition } from '@gitbook/api';
import stylelint from 'stylelint';
import { generateFontFacesCSS, getFontSourcesToPreload } from './custom';

const TEST_FONTS_BASIC: CustomizationFontDefinition = {
    id: 'open-sans',
    custom: true,
    fontFamily: 'Open Sans',
    fontFaces: [
        {
            weight: 400,
            sources: [
                {
                    url: 'https://example.com/fonts/opensans-regular.woff2',
                    format: 'woff2',
                },
            ],
        },
        {
            weight: 700,
            sources: [
                {
                    url: 'https://example.com/fonts/opensans-bold.woff2',
                    format: 'woff2',
                },
            ],
        },
    ],
    permissions: {
        edit: false,
    },
};

const TEST_FONTS_MULTI_WEIGHT: CustomizationFontDefinition = {
    id: 'roboto',
    custom: true,
    fontFamily: 'Roboto',
    fontFaces: [
        {
            weight: 300,
            sources: [
                {
                    url: 'https://example.com/fonts/roboto-light.woff2',
                    format: 'woff2',
                },
            ],
        },
        {
            weight: 400,
            sources: [
                {
                    url: 'https://example.com/fonts/roboto-regular.woff2',
                    format: 'woff2',
                },
            ],
        },
        {
            weight: 500,
            sources: [
                {
                    url: 'https://example.com/fonts/roboto-medium.woff2',
                    format: 'woff2',
                },
            ],
        },
        {
            weight: 700,
            sources: [
                {
                    url: 'https://example.com/fonts/roboto-bold.woff2',
                    format: 'woff2',
                },
            ],
        },
        {
            weight: 900,
            sources: [
                {
                    url: 'https://example.com/fonts/roboto-black.woff2',
                    format: 'woff2',
                },
            ],
        },
    ],
    permissions: {
        edit: false,
    },
};

const TEST_FONTS_MULTI_SOURCE: CustomizationFontDefinition = {
    id: 'lato',
    custom: true,
    fontFamily: 'Lato',
    fontFaces: [
        {
            weight: 400,
            sources: [
                {
                    url: 'https://example.com/fonts/lato-regular.woff2',
                    format: 'woff2',
                },
                { url: 'https://example.com/fonts/lato-regular.woff', format: 'woff' },
            ],
        },
    ],
    permissions: {
        edit: false,
    },
};

const TEST_FONTS_MISSING_FORMAT: CustomizationFontDefinition = {
    id: 'source-sans',
    custom: true,
    fontFamily: 'Source Sans Pro',
    fontFaces: [
        {
            weight: 400,
            sources: [
                { url: 'https://example.com/fonts/sourcesans-regular.woff2' },
                {
                    url: 'https://example.com/fonts/sourcesans-regular.woff',
                    format: 'woff',
                },
            ],
        },
    ],
    permissions: {
        edit: false,
    },
};

const TEST_FONTS_EMPTY: CustomizationFontDefinition = {
    id: 'empty-font',
    custom: true,
    fontFamily: 'Empty Font',
    fontFaces: [],
    permissions: {
        edit: false,
    },
};

const TEST_FONTS_SPECIAL_CHARS: CustomizationFontDefinition = {
    id: 'special-font',
    custom: true,
    fontFamily: 'Special Font & Co.',
    fontFaces: [
        {
            weight: 400,
            sources: [{ url: 'https://example.com/fonts/special.woff2', format: 'woff2' }],
        },
    ],
    permissions: {
        edit: false,
    },
};

const TEST_FONTS_COMPLEX: CustomizationFontDefinition = {
    id: 'complex-font',
    custom: true,
    fontFamily: 'Complex Font',
    fontFaces: [
        {
            weight: 400,
            sources: [
                { url: 'https://example.com/fonts/regular.woff2' },
                { url: 'https://example.com/fonts/regular.woff' },
            ],
        },
        {
            weight: 700,
            sources: [
                { url: 'https://example.com/fonts/bold.woff2' },
                { url: 'https://example.com/fonts/bold.woff' },
            ],
        },
    ],
    permissions: {
        edit: false,
    },
};

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
        const css = generateFontFacesCSS(TEST_FONTS_BASIC, 'content');

        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain('font-weight: 400');
        expect(css).toContain('font-weight: 700');
        expect(css).toContain(
            "url(https://example.com/fonts/opensans-regular.woff2) format('woff2')"
        );
        expect(css).toContain("url(https://example.com/fonts/opensans-bold.woff2) format('woff2')");
        expect(css).toContain('--font-content: CustomFont_content');
    });

    test('mono type', async () => {
        const css = generateFontFacesCSS(TEST_FONTS_BASIC, 'mono');

        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain('font-weight: 400');
        expect(css).toContain('font-weight: 700');
        expect(css).toContain(
            "url(https://example.com/fonts/opensans-regular.woff2) format('woff2')"
        );
        expect(css).toContain("url(https://example.com/fonts/opensans-bold.woff2) format('woff2')");
        expect(css).toContain('--font-mono: CustomFont_mono');
    });

    test('multiple font weights', async () => {
        const css = generateFontFacesCSS(TEST_FONTS_MULTI_WEIGHT, 'content');

        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        [300, 400, 500, 700, 900].forEach((weight) => {
            expect(css).toContain(`font-weight: ${weight}`);
        });
    });

    test('multiple sources for a single weight', async () => {
        const css = generateFontFacesCSS(TEST_FONTS_MULTI_SOURCE, 'content');

        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain(
            "url(https://example.com/fonts/lato-regular.woff2) format('woff2'), url(https://example.com/fonts/lato-regular.woff) format('woff')"
        );
    });

    test('missing format property', async () => {
        const css = generateFontFacesCSS(TEST_FONTS_MISSING_FORMAT, 'content');

        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);

        expect(css).toContain(
            "url(https://example.com/fonts/sourcesans-regular.woff2), url(https://example.com/fonts/sourcesans-regular.woff) format('woff')"
        );
    });

    test('empty font faces array', async () => {
        const css = generateFontFacesCSS(TEST_FONTS_EMPTY, 'content');

        expect(css).toBe('');
    });

    test('font with special characters in name', async () => {
        const css = generateFontFacesCSS(TEST_FONTS_SPECIAL_CHARS, 'content');

        // Validate CSS syntax
        const isValid = await isCSSValid(css);
        expect(isValid).toBe(true);
    });
});

describe('getFontSourcesToPreload', () => {
    const preloadTestCases = [
        { name: 'basic case', font: TEST_FONTS_BASIC, expectedCount: 2 },
        { name: 'multiple weights', font: TEST_FONTS_MULTI_WEIGHT, expectedCount: 2 },
        { name: 'multiple sources', font: TEST_FONTS_MULTI_SOURCE, expectedCount: 2 },
        { name: 'missing format', font: TEST_FONTS_MISSING_FORMAT, expectedCount: 2 },
        { name: 'empty font faces', font: TEST_FONTS_EMPTY, expectedCount: 0 },
        { name: 'special characters', font: TEST_FONTS_SPECIAL_CHARS, expectedCount: 1 },
        { name: 'complex case', font: TEST_FONTS_COMPLEX, expectedCount: 4 },
    ];

    preloadTestCases.forEach(({ name, font, expectedCount }) => {
        test(`extracts ${expectedCount} URLs from ${name}`, () => {
            const result = getFontSourcesToPreload(font).flatMap((face) => face.sources);
            expect(result).toBeArray();
            expect(result.length).toBe(expectedCount);
        });
    });
});
