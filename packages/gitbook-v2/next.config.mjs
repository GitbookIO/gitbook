// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    experimental: {
        useCache: true,

        // We can't use dynamicIO because it doesn't accept reading params in the root layout
        // dynamicIO: true,
    },

    env: {
        BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),
        GITBOOK_URL: process.env.GITBOOK_URL,
        GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
        GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
        GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
    },
};

export default nextConfig;
