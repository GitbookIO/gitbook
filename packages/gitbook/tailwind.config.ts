import containerQueries from '@tailwindcss/container-queries';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

import { ColorCategory, hexToRgb, scale, shadesOfColor } from '@gitbook/colors';

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
export const opacities = [0, 4, 8, 12, 16, 24, 40, 64, 72, 88, 96, 100];

export const semanticColors = ['info', 'warning', 'danger', 'success'];

/**
 * Generate a Tailwind color shades from a variable.
 */
function generateVarShades(varName: string, filter: ColorCategory[] = []) {
    const result: { [key: string]: string } = {};

    for (const [categoryName, category] of Object.entries(scale)) {
        if (filter.length === 0 || filter.includes(categoryName as ColorCategory)) {
            for (const [key, value] of Object.entries(category)) {
                if (filter.length > 0) {
                    result[key] = `rgb(var(--${varName}-${value}))`;
                } else {
                    result[value] = `rgb(var(--${varName}-${value}))`;
                }
            }
        }
    }

    return result;
}

/**
 * Generate a Tailwind color shades from a HEX color.
 */
function generateShades(color: string) {
    const rawShades = shadesOfColor(color);
    const shadeMap = shades.reduce(
        (acc, shade) => {
            acc[shade] = `rgb(${hexToRgb(rawShades[`${shade}`])} / <alpha-value>)`;
            return acc;
        },
        {} as Record<string, string>
    );

    shadeMap.DEFAULT = shadeMap[500];

    return shadeMap;
}

function opacity() {
    return opacities.reduce(
        (acc, opacity, index) => {
            acc[index] = `${opacity / 100}`;
            return acc;
        },
        {} as Record<string, string>
    );
}

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            aria: {
                'current-page': 'current="page"',
            },
            fontFamily: {
                sans: ['var(--font-content)'],
                mono: ['var(--font-mono)'],
                emoji: [
                    'Apple Color Emoji',
                    'Noto Color Emoji',
                    'var(--font-noto-color-emoji)',
                    'sans-serif',
                ],
                custom: ['var(--font-custom)'],
                var: ['var(--font-family)'],
            },
            colors: {
                // Dynamic colors matching the customization settings

                /** Scale based on the primary color, used for links and interactive elements. */
                primary: generateVarShades('primary'),
                /** Contrasting foreground color that can be used on top of `primary`. Black or white depending on shade. */
                'contrast-primary': generateVarShades('contrast-primary'),

                /** The main color scale for non-interactive elements. Will either be a (slightly tinted) gray scale or a user-set value through Customisation. */
                tint: generateVarShades('tint'),
                /** Contrasting foreground color that can be used on top of `tint`. Black or white depending on shade. */
                'contrast-tint': generateVarShades('contrast-tint'),

                /** Will always be a neutral gray scale, without any tinting or overrides. Use only when `tint` somehow clashes. */
                neutral: generateVarShades('neutral'),
                /** Contrasting foreground color that can be used on top of `neutral`. Black or white depending on shade. */
                'contrast-neutral': generateVarShades('contrast-neutral'),

                'header-background': 'rgb(var(--header-background))',
                'header-link': 'rgb(var(--header-link))',

                // Add each semantic color
                ...Object.fromEntries(
                    semanticColors.map((color) => [color, generateVarShades(color)])
                ),
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        `contrast-${color}`,
                        generateVarShades(`contrast-${color}`),
                    ])
                ),

                yellow: generateShades('#f4e28d'),
                teal: generateShades('#3f89a1'),
                pomegranate: generateShades('#f25b3a'),
                periwinkle: generateShades('#acc6ee'),
            },
            backgroundColor: {
                'mark-blue': '#89C6DA4D',
                'mark-purple': '#DAD4FF4D',
                'mark-orange': '#FFDCBC4D',
                'mark-red': '#FFCCCB4D',
                'mark-yellow': '#FFF0854D',
                'mark-green': '#91EABF4D',
                primary: generateVarShades('primary', [
                    ColorCategory.backgrounds,
                    ColorCategory.components,
                    ColorCategory.accents,
                ]),
                tint: generateVarShades('tint', [
                    ColorCategory.backgrounds,
                    ColorCategory.components,
                    ColorCategory.accents,
                ]),
                neutral: generateVarShades('neutral', [
                    ColorCategory.backgrounds,
                    ColorCategory.components,
                    ColorCategory.accents,
                ]),
                // Semantic colors
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        color,
                        generateVarShades(color, [
                            ColorCategory.backgrounds,
                            ColorCategory.components,
                            ColorCategory.accents,
                        ]),
                    ])
                ),
            },
            gradientColorStops: {
                primary: generateVarShades('primary', [
                    ColorCategory.backgrounds,
                    ColorCategory.components,
                    ColorCategory.accents,
                ]),
                tint: generateVarShades('tint', [
                    ColorCategory.backgrounds,
                    ColorCategory.components,
                    ColorCategory.accents,
                ]),
                neutral: generateVarShades('neutral', [
                    ColorCategory.backgrounds,
                    ColorCategory.components,
                    ColorCategory.accents,
                ]),
                // Semantic colors
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        color,
                        generateVarShades(color, [
                            ColorCategory.backgrounds,
                            ColorCategory.components,
                            ColorCategory.accents,
                        ]),
                    ])
                ),
            },
            borderColor: {
                primary: generateVarShades('primary', [
                    ColorCategory.borders,
                    ColorCategory.accents,
                ]),
                tint: generateVarShades('tint', [ColorCategory.borders, ColorCategory.accents]),
                neutral: generateVarShades('neutral', [
                    ColorCategory.borders,
                    ColorCategory.accents,
                ]),
                // Semantic colors
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        color,
                        generateVarShades(color, [ColorCategory.borders, ColorCategory.accents]),
                    ])
                ),
            },
            ringColor: {
                primary: generateVarShades('primary', [ColorCategory.borders]),
                tint: generateVarShades('tint', [ColorCategory.borders]),
                neutral: generateVarShades('neutral', [ColorCategory.borders]),
                // Semantic colors
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        color,
                        generateVarShades(color, [ColorCategory.borders]),
                    ])
                ),
            },
            outlineColor: {
                primary: generateVarShades('primary', [ColorCategory.borders]),
                tint: generateVarShades('tint', [ColorCategory.borders]),
                neutral: generateVarShades('neutral', [ColorCategory.borders]),
                // Semantic colors
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        color,
                        generateVarShades(color, [ColorCategory.borders]),
                    ])
                ),
            },
            boxShadowColor: {
                primary: generateVarShades('primary', [ColorCategory.borders]),
                tint: generateVarShades('tint', [ColorCategory.borders]),
                neutral: generateVarShades('neutral', [ColorCategory.borders]),
                // Semantic colors
                ...Object.fromEntries(
                    semanticColors.map((color) => [
                        color,
                        generateVarShades(color, [ColorCategory.borders]),
                    ])
                ),
            },
            textColor: {
                primary: generateVarShades('primary', [ColorCategory.text]),
                'contrast-primary': generateVarShades('contrast-primary', [
                    ColorCategory.backgrounds,
                    ColorCategory.accents,
                ]),
                tint: generateVarShades('tint', [ColorCategory.text]),
                'contrast-tint': generateVarShades('contrast-tint', [
                    ColorCategory.backgrounds,
                    ColorCategory.accents,
                ]),
                neutral: generateVarShades('neutral', [ColorCategory.text]),
                'contrast-neutral': generateVarShades('contrast-neutral', [
                    ColorCategory.backgrounds,
                    ColorCategory.accents,
                ]),
                ...Object.fromEntries(
                    semanticColors.flatMap((color) => [
                        [color, generateVarShades(color, [ColorCategory.text])],
                        [
                            `contrast-${color}`,
                            generateVarShades(`contrast-${color}`, [
                                ColorCategory.backgrounds,
                                ColorCategory.accents,
                            ]),
                        ],
                    ])
                ),
            },
            textDecorationColor: {
                primary: generateVarShades('primary', [ColorCategory.text]),
                'contrast-primary': generateVarShades('contrast-primary', [
                    ColorCategory.backgrounds,
                    ColorCategory.accents,
                ]),
                tint: generateVarShades('tint', [ColorCategory.text]),
                'contrast-tint': generateVarShades('contrast-tint', [
                    ColorCategory.backgrounds,
                    ColorCategory.accents,
                ]),
                neutral: generateVarShades('neutral', [ColorCategory.text]),
                'contrast-neutral': generateVarShades('contrast-neutral', [
                    ColorCategory.backgrounds,
                    ColorCategory.accents,
                ]),
                ...Object.fromEntries(
                    semanticColors.flatMap((color) => [
                        [color, generateVarShades(color, [ColorCategory.text])],
                        [
                            `contrast-${color}`,
                            generateVarShades(`contrast-${color}`, [
                                ColorCategory.backgrounds,
                                ColorCategory.accents,
                            ]),
                        ],
                    ])
                ),
            },
            animation: {
                present: 'present .5s ease-out both',
                scaleIn: 'scaleIn 200ms ease',
                scaleOut: 'scaleOut 200ms ease',
                fadeIn: 'fadeIn 200ms ease forwards',
                fadeOut: 'fadeOut 200ms ease forwards',
                enterFromLeft: 'enterFromLeft 250ms ease',
                enterFromRight: 'enterFromRight 250ms ease',
                exitToLeft: 'exitToLeft 250ms ease',
                exitToRight: 'exitToRight 250ms ease',
            },
            keyframes: {
                pulseAlt: {
                    '0%': {
                        transform: 'scale(0.01)',
                        opacity: '0',
                    },
                    '70%': {
                        opacity: '1',
                    },
                    '100%': {
                        transform: 'scale(2.8)',
                        opacity: '0',
                    },
                },
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                present: {
                    from: {
                        opacity: '0',
                        transform: 'translateY(2rem) scale(0.9)',
                    },
                    to: {
                        opacity: '1',
                        transform: 'translateY(0) scale(1)',
                    },
                },
                rotateLoop: {
                    '0%': {
                        transform: 'rotate(0deg) scaleY(2.5) scaleX(2.5)',
                    },
                    '100%': {
                        transform: 'rotate(360deg) scaleY(2.5) scaleX(2.5)',
                    },
                },
                pingAlt: {
                    '0%': {
                        transform: 'scale(0.1)',
                        opacity: '0',
                    },
                    '20%': {
                        opacity: '1',
                    },
                    '30%, 100%': {
                        transform: 'scale(5)',
                        opacity: '0',
                    },
                },
                wag: {
                    '0%, 40%': {
                        transform: 'rotate(0deg)',
                    },
                    '45%': {
                        transform: 'rotate(-10deg)',
                    },
                    '55%': {
                        transform: 'rotate(10deg)',
                    },
                    '60%, 100%': {
                        transform: 'rotate(0deg)',
                    },
                },
                pathLoading: {
                    '0%': {
                        strokeDasharray: '0 100',
                        strokeDashoffset: '0',
                        opacity: '0',
                    },
                    '40%, 60%': {
                        strokeDasharray: '100 100',
                        strokeDashoffset: '0',
                        opacity: '1',
                    },
                    '100%': {
                        strokeDasharray: '100 100',
                        strokeDashoffset: '-100',
                        opacity: '0',
                    },
                },
                stroke: {
                    '0%': {
                        strokeDasharray: '0 100',
                        strokeDashoffset: '0',
                        opacity: '0',
                    },
                    '20%, 80%': {
                        strokeDasharray: '100 100',
                        strokeDashoffset: '0',
                        opacity: '1',
                    },
                    '100%': {
                        strokeDasharray: '100 100',
                        strokeDashoffset: '-100',
                        opacity: '0',
                    },
                },
                enterFromRight: {
                    from: { opacity: '0', transform: 'translateX(200px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                enterFromLeft: {
                    from: { opacity: '0', transform: 'translateX(-200px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                exitToRight: {
                    from: { opacity: '1', transform: 'translateX(0)' },
                    to: { opacity: '0', transform: 'translateX(200px)' },
                },
                exitToLeft: {
                    from: { opacity: '1', transform: 'translateX(0)' },
                    to: { opacity: '0', transform: 'translateX(-200px)' },
                },
                scaleIn: {
                    from: { opacity: '0', transform: 'rotateX(-10deg) scale(0.9)' },
                    to: { opacity: '1', transform: 'rotateX(0deg) scale(1)' },
                },
                scaleOut: {
                    from: { opacity: '1', transform: 'rotateX(0deg) scale(1)' },
                    to: { opacity: '0', transform: 'rotateX(-10deg) scale(0.95)' },
                },
                fadeOut: {
                    from: { opacity: '1' },
                    to: { opacity: '0' },
                },
            },
            boxShadow: {
                thinbottom: '0px 1px 0px rgba(0, 0, 0, 0.05)',
                thintop: '0px -1px 0px  rgba(0, 0, 0, 0.05)',
                '1xs': '0px 1px 1px rgba(0, 0, 0, 0.09), 0px 3.267px 2.754px rgb(0, 0, 0, 0.05), 0px 6.278px 6.63px rgb(0, 0, 0, 0.05), 0px 14px 22px rgb(0, 0, 0, 0.04)',
            },
            scale: {
                '98': '0.98',
                '102': '1.02',
            },
        },
        opacity: opacity(),
    },
    plugins: [
        plugin(({ addVariant }) => {
            /**
             * Variant when the Table of Content navigation is open.
             */
            addVariant('navigation-open', 'body.navigation-open &');

            /**
             * Variant when a header is displayed.
             */
            addVariant('site-header-none', 'html.site-header-none &');
            addVariant('site-header', 'body:has(#site-header:not(.mobile-only)) &');
            addVariant('site-header-sections', [
                'body:has(#site-header:not(.mobile-only) #sections) &',
                'body:has(.page-no-toc):has(#site-header:not(.mobile-only) #variants) &',
            ]);

            const customisationVariants = {
                // Sidebar styles
                sidebar: ['sidebar-default', 'sidebar-filled'],

                // List styles
                list: ['sidebar-list-default', 'sidebar-list-pill', 'sidebar-list-line'],

                // Tint colours
                tint: ['tint', 'no-tint'],

                // Themes
                theme: ['theme-clean', 'theme-muted', 'theme-bold', 'theme-gradient'],

                // Corner styles
                corner: ['straight-corners'],

                // Link styles
                links: ['links-default', 'links-accent'],
            };

            for (const [category, variants] of Object.entries(customisationVariants)) {
                for (const variant of variants) {
                    addVariant(variant, `html.${variant} &`);

                    if (category === 'tint') {
                        /* Because we check for a class on the `html` element, like `html.$variant`, we cannot easily chain customisation variants "the Tailwind way". 
                        Basically, when you write `theme-clean:tint:`, you're creating a CSS selector like `html.theme-clean html.tint &`.
                        We need the selector to apply to the same element, like `html.$variant.$otherVariant` instead.
                        Instead of relying on Tailwind variant chaining, we manually create a few additional variants for often-used combinations like theme+tint. */
                        for (const themeVariant of customisationVariants.theme) {
                            addVariant(
                                `${themeVariant}-${variant}`, // theme-clean-tint, theme-clean-no-tint, theme-muted-tint, ...
                                `html.${variant}.${themeVariant} &` // html.theme-clean.tint, html.theme-clean.no-tint, ...
                            );
                        }
                    }
                }
            }

            /**
             * Variant when the page contains a block that will be rendered in full-width mode.
             */
            addVariant('page-full-width', 'body:has(.page-full-width) &');
            addVariant('page-default-width', 'body:has(.page-default-width) &');

            /**
             * Variant when the page is configured to hide the table of content.
             * `page.layout.tableOfContents` is set to false.
             */
            addVariant('page-no-toc', 'body:has(.page-no-toc) &');
            addVariant('page-has-toc', 'body:has(.page-has-toc) &');

            /**
             * Variant when the page contains an OpenAPI block.
             */
            addVariant('page-api-block', 'body:has(.openapi-block) &');

            /**
             * Variant when the page is displayed in print mode.
             */
            addVariant('print-mode', 'body:has(.print-mode) &');
        }),
        plugin(({ matchUtilities }) => {
            matchUtilities({
                perspective: (value) => ({
                    perspective: value,
                }),
            });
        }),
        containerQueries,
        typography,
    ],
};
export default config;
