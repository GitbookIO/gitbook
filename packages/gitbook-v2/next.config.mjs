// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    experimental: {
        useCache: true,
    },

    env: {
        BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),

        // GitBook envs
        GITBOOK_URL: process.env.GITBOOK_URL,
        GITBOOK_SECRET: process.env.GITBOOK_SECRET,
        GITBOOK_API_URL: process.env.GITBOOK_API_URL,
        GITBOOK_API_TOKEN: process.env.GITBOOK_API_TOKEN,
        GITBOOK_APP_URL: process.env.GITBOOK_APP_URL,
        GITBOOK_INTEGRATIONS_HOST: process.env.GITBOOK_INTEGRATIONS_HOST,
        GITBOOK_IMAGE_RESIZE_SIGNING_KEY: process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
        GITBOOK_IMAGE_RESIZE_URL: process.env.GITBOOK_IMAGE_RESIZE_URL,
        GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
        GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
        GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,

        // Next.js envs
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,

        // Used to detect if the app is running in V2 mode
        GITBOOK_V2: 'true',
    },

    assetPrefix: process.env.GITBOOK_ASSETS_PREFIX,
    poweredByHeader: false,

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.gitbook.io',
            },
        ],
    },
};

export default nextConfig;
