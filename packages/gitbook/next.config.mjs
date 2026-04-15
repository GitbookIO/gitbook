// @ts-check

// We don't use the deployment ID yet on 2c, we need to remove it because of https://github.com/opennextjs/opennextjs-aws/issues/1136
let deploymentId =
    process.env.GITBOOK_RUNTIME === 'cloudflare'
        ? undefined
        : process.env.GITBOOK_HEAD_SHA || process.env.GITHUB_SHA || Date.now().toString(); // Needed because we use a custom deployment method i.e. https://vercel.com/docs/skew-protection#custom-deployment-id

const { VERCEL_TARGET_ENV } = process.env;

// Because preview, staging and prod shares the same SHA, the deployment will fail if we don't prefix it with the environment name.
if (VERCEL_TARGET_ENV === 'preview') {
    deploymentId = `t-${deploymentId}`;
} else if (VERCEL_TARGET_ENV === 'staging') {
    deploymentId = `s-${deploymentId}`;
} else if (VERCEL_TARGET_ENV === 'production') {
    deploymentId = `p-${deploymentId}`;
}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    deploymentId: deploymentId?.slice(0, 32), // Vercel's deployment ID has a max length of 32 characters
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
        // Disable splitting the RSC in like 5 chunks
        prefetchInlining: true,
    },

    env: {
        BUILD_VERSION: (process.env.GITBOOK_HEAD_SHA ?? process.env.GITHUB_SHA ?? '').slice(0, 7),

        // GitBook envs
        GITBOOK_API_URL: process.env.GITBOOK_API_URL,
        GITBOOK_APP_URL: process.env.GITBOOK_APP_URL,
        GITBOOK_OAUTH_SERVER_URL: process.env.GITBOOK_OAUTH_SERVER_URL,
        GITBOOK_PREVIEW_BASE_URL: process.env.GITBOOK_PREVIEW_BASE_URL,
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
