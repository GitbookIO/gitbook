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
        GITBOOK_URL: process.env.GITBOOK_URL,
        GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
        GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
        GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,
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
