import type { Config } from 'tailwindcss';

export const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
export const opacities = [4, 8, 12, 16, 24, 40, 64, 72, 88, 96];

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
            acc[index + 1] = `${opacity / 100}`;
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
            colors: {
                // Dynamic colors matching the customization settings
                primary: generateShades('primary-color'),
                dark: 'rgb(var(--dark) / <alpha-value>)',
                light: 'rgb(var(--light) / <alpha-value>)',
                vanta: 'rgb(var(--vanta) / <alpha-value>)',
                metal: 'rgb(var(--metal) / <alpha-value>)',
                yellow: 'rgb(var(--yellow) / <alpha-value>)',
                periwinkle: 'rgb(var(--periwinkle) / <alpha-value>)',
                pomegranate: 'rgb(var(--pomegranate) / <alpha-value>)',
                teal: 'rgb(var(--teal) / <alpha-value>)',
                'header-background': generateShades('header-background'),
                'header-link': generateShades('header-link'),
            },
        },
        opacity: opacity(),
    },
    plugins: [],
};
export default config;
