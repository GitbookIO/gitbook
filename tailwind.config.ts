import type { Config } from 'tailwindcss';

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
                primary: {
                    100: 'var(--primary-color-100)',
                    500: 'var(--primary-color-500)',
                },
            },
        },
    },
    plugins: [],
};
export default config;
