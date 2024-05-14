const { withSentryConfig } = require('@sentry/nextjs');

module.exports = {
    env: {
        BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),
        SENTRY_DSN: process.env.SENTRY_DSN ?? '',
        SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT ?? 'development',
        GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
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
                hostname: '**.gitbook.io',
                port: '',
            },
        ]
    }
};

// module.exports = withSentryConfig(
//     nextConfig,    
//     {
//         silent: true,
//         org: process.env.SENTRY_ORG,
//         project: process.env.SENTRY_PROJECT,
//     },
//     {
//         // Upload a larger set of source maps for prettier stack traces (increases build time)
//         widenClientFileUpload: true,
//         transpileClientSDK: false,
//         // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
//         tunnelRoute: '/~gitbook/monitoring',
//         // Don't hide source maps from generated client bundles
//         hideSourceMaps: false,
//         disableLogger: true,
//         automaticVercelMonitors: false,
//     },
// );
