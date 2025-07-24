// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    experimental: {
        // This is needed to throw "forbidden" when the api token expired during revalidation
        authInterrupts: true,
        useCache: true,

        // Content is fully static, we can cache it in the session memory cache for a long time
        staleTimes: {
            dynamic: 3600, // 1 hour
            static: 3600, // 1 hour
        },

        // Since content is fully static, we don't want to fetch on hover again
        optimisticClientCache: false,
    },

    env: {
        BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),

        // GitBook envs
        GITBOOK_API_URL: process.env.GITBOOK_API_URL,
        GITBOOK_APP_URL: process.env.GITBOOK_APP_URL,
        GITBOOK_INTEGRATIONS_HOST: process.env.GITBOOK_INTEGRATIONS_HOST,
        GITBOOK_IMAGE_RESIZE_URL: process.env.GITBOOK_IMAGE_RESIZE_URL,
        GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
        GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,
        GITBOOK_URL: process.env.GITBOOK_URL,
        GITBOOK_API_TOKEN: process.env.GITBOOK_API_TOKEN,
        GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
        GITBOOK_SECRET: process.env.GITBOOK_SECRET,
        GITBOOK_IMAGE_RESIZE_SIGNING_KEY: process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
        GITBOOK_IMAGE_RESIZE_MODE: process.env.GITBOOK_IMAGE_RESIZE_MODE,
        GITBOOK_FONTS_URL: process.env.GITBOOK_FONTS_URL,
        GITBOOK_RUNTIME: process.env.GITBOOK_RUNTIME,

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

    async headers() {
        return [
            {
                source: '/~gitbook/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
