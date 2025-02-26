import config from '../gitbook/tailwind.config';

export default {
    ...config,
    content: [
        '../gitbook/src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        '../gitbook/src/components/**/*.{js,ts,jsx,tsx,mdx}',
        '../gitbook/src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
};
