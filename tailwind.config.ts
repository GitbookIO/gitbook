import containerQueries from '@tailwindcss/container-queries';
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
                primary: generateShades('primary-color'),
                light: {
                    1: `color-mix(in srgb, rgb(var(--primary-color-600)), rgb(var(--light) / <alpha-value>) 98%)`,
                    DEFAULT: `color-mix(in srgb, rgb(var(--primary-color-700)), rgb(var(--light) / <alpha-value>) 96%)`,
                    2: `color-mix(in srgb, rgb(var(--primary-color-800)), rgb(var(--light) / <alpha-value>) 92%)`,
                    3: `color-mix(in srgb, rgb(var(--primary-color-800)), rgb(var(--light) / <alpha-value>) 88%)`,
                    4: `color-mix(in srgb, rgb(var(--primary-color-800)), rgb(var(--light) / <alpha-value>) 82%)`,
                    5: `color-mix(in srgb, rgb(var(--primary-color-800)), rgb(var(--light) / <alpha-value>) 64%)`,
                },
                dark: {
                    1: `color-mix(in srgb, rgb(var(--primary-color-100)), rgb(var(--dark) / <alpha-value>) 98%)`,
                    DEFAULT: `color-mix(in srgb, rgb(var(--primary-color-300)), rgb(var(--dark) / <alpha-value>) 96%)`,
                    2: `color-mix(in srgb, rgb(var(--primary-color-200)), rgb(var(--dark) / <alpha-value>) 92%)`,
                    3: `color-mix(in srgb, rgb(var(--primary-color-200)), rgb(var(--dark) / <alpha-value>) 88%)`,
                    4: `color-mix(in srgb, rgb(var(--primary-color-200)), rgb(var(--dark) / <alpha-value>) 82%)`,
                    5: `color-mix(in srgb, rgb(var(--primary-color-200)), rgb(var(--dark) / <alpha-value>) 64%)`,
                },
                yellow: generateShades('yellow'),
                teal: generateShades('teal'),
                pomegranate: generateShades('pomegranate'),
                vanta: 'rgb(var(--vanta) / <alpha-value>)',
                metal: 'rgb(var(--metal) / <alpha-value>)',
                sky: 'rgb(var(--sky) / <alpha-value>)',
                periwinkle: 'rgb(var(--periwinkle) / <alpha-value>)',
                'header-background': generateShades('header-background'),
                'header-link': generateShades('header-link'),
            },
            keyframes: {
                pulse: {
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
            addVariant('navigation-open', 'body.navigation-open &');
            addVariant('search-open', 'body.search-open &');
            addVariant('page-full-width', 'body.page-full-width &');
        }),
        containerQueries,
    ],
};
export default config;
