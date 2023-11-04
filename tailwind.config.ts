import type { Config } from 'tailwindcss';

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

function generateShades(varName: string) {
    return shades.reduce(
        (acc, shade) => {
            acc[shade] = `var(--${varName}-${shade})`;
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
                // Dynamic color to present the space primary color
                primary: generateShades('primary-color'),
            },
        },
    },
    plugins: [],
};
export default config;
