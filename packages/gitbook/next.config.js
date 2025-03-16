module.exports = {
    env: {
        BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),
        GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
        GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
        GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,
        NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
    },

    webpack(config) {
        config.resolve.fallback = {
            ...config.resolve.fallback,

            // Required for `swagger2openapi` to work:
            fs: false,
            path: false,
            http: false,
        };

        return config;
    },

    async headers() {
        return [
            // Cache all static assets for 1 year
            {
                source: '/~gitbook/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
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
