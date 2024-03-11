import containerQueries from '@tailwindcss/container-queries';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
export const opacities = [0, 4, 8, 12, 16, 24, 40, 64, 72, 88, 96];

function generateShades(varName: string) {
    return shades.reduce(
        (acc, shade) => {
            acc[shade] = `rgb(var(--${varName}-${shade}) / <alpha-value>)`;
            return acc;
        },
        { DEFAULT: `rgb(var(--${varName}-500) / <alpha-value>)` } as Record<string, string>,
    );
}

function opacity() {
    return opacities.reduce(
        (acc, opacity, index) => {
            acc[index] = `${opacity / 100}`;
            return acc;
        },
        {} as Record<string, string>,
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
            fontFamily: {
                sans: ['var(--font-content)'],
                mono: ['var(--font-mono)'],
            },
            colors: {
                // Dynamic colors matching the customization settings

                /** primary-color used to accent elements, these colors remain unchanged when toggling between the CustomizationBackground options**/
                primary: generateShades('primary-color'),

                /** primary-base is an internal color that generates the same colors as primary-color. But it's shades will change into a grayscale if CustomizationBackground.Plain is selected. (globals.css) **/
                primarybase: generateShades('primary-base'),

                light: {
                    1: `color-mix(in srgb, var(--light-1), transparent calc(100% - 100% * <alpha-value>))`, //1 99%
                    DEFAULT: `color-mix(in srgb, var(--light-DEFAULT), transparent calc(100% - 100% * <alpha-value>))`, //(default) 96%
                    2: `color-mix(in srgb, var(--light-2), transparent calc(100% - 100% * <alpha-value>))`, //2 92%
                    3: `color-mix(in srgb, var(--light-3), transparent calc(100% - 100% * <alpha-value>))`, //4 82%
                    4: `color-mix(in srgb, var(--light-4), transparent calc(100% - 100% * <alpha-value>))`, //5 64%
                },
                dark: {
                    1: `color-mix(in srgb, var(--dark-1), transparent calc(100% - 100% * <alpha-value>))`, //1 99%
                    DEFAULT: `color-mix(in srgb, var(--dark-DEFAULT), transparent calc(100% - 100% * <alpha-value>))`, //(default) 96%
                    2: `color-mix(in srgb, var(--dark-2), transparent calc(100% - 100% * <alpha-value>))`, //2 92%
                    3: `color-mix(in srgb, var(--dark-3), transparent calc(100% - 100% * <alpha-value>))`, //4 82%
                    4: `color-mix(in srgb, var(--dark-4), transparent calc(100% - 100% * <alpha-value>))`, //5 64%
                },
                yellow: generateShades('yellow'),
                teal: generateShades('teal'),
                pomegranate: generateShades('pomegranate'),
                periwinkle: generateShades('periwinkle'),
                'header-background': generateShades('header-background'),
                'header-link': generateShades('header-link'),
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
            },
            boxShadow: {
                thinbottom: '0px 1px 0px rgba(0, 0, 0, 0.05)',
                '1xs': '0px 1px 1px rgba(0, 0, 0, 0.09), 0px 3.267px 2.754px rgb(0, 0, 0, 0.05), 0px 6.278px 6.63px rgb(0, 0, 0, 0.05), 0px 14px 22px rgb(0, 0, 0, 0.04)',
            },
        },
        opacity: opacity(),
    },
    plugins: [
        plugin(function ({ addVariant }) {
            /**
             * Variant when the Table of Content navigation is open.
             */
            addVariant('navigation-open', 'body.navigation-open &');

            /**
             * Variant when the search overlay is open.
             */
            addVariant('search-open', 'body.search-open &');

            /**
             * Variant when a header is displayed.
             */
            addVariant('space-header', 'body:has(header) &');

            /**
             * Variant when the space is configured with straight corners.
             */
            addVariant('straight-corners', 'html.straight-corners &');

            /**
             * Variant when the space is configured with a theme matching background.
             */
            addVariant('plain-background', 'html.plain-background &');

            /**
             * Variant when the page contains a block that will be rendered in full-width mode.
             */
            addVariant('page-full-width', 'body:has(.page-full-width) &');

            /**
             * Variant when the page is configured to hide the table of content.
             * `page.layout.tableOfContents` is set to false.
             */
            addVariant('page-no-toc', 'body:has(.page-no-toc) &');

            /**
             * Variant when the page contains an OpenAPI block.
             */
            addVariant('page-api-block', 'body:has(.openapi-block) &');

            /**
             * Variant when the page is displayed in print mode.
             */
            addVariant('print-mode', 'body:has(.print-mode) &');
        }),
        containerQueries,
        typography,
    ],
};
export default config;
