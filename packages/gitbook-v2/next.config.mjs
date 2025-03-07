// @ts-check

/**
 * Environment variables required to be set in production mode.
 * In local development, these can be skipped.
 */
const gitbookRequiredEnvs = {
    GITBOOK_SECRET: process.env.GITBOOK_SECRET,
    GITBOOK_API_URL: process.env.GITBOOK_API_URL,
    GITBOOK_APP_URL: process.env.GITBOOK_APP_URL,
    GITBOOK_INTEGRATIONS_HOST: process.env.GITBOOK_INTEGRATIONS_HOST,
    GITBOOK_IMAGE_RESIZE_SIGNING_KEY: process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY,
    GITBOOK_IMAGE_RESIZE_URL: process.env.GITBOOK_IMAGE_RESIZE_URL,
    GITBOOK_ICONS_URL: process.env.GITBOOK_ICONS_URL,
    GITBOOK_ICONS_TOKEN: process.env.GITBOOK_ICONS_TOKEN,
};

/**
 * Environment variables that are optional in production mode.
 * While it's recommended to set them, they are not required and can be inferred from the environment.
 */
const gitbookOptionalEnvs = {
    GITBOOK_URL: process.env.GITBOOK_URL,
    GITBOOK_API_TOKEN: process.env.GITBOOK_API_TOKEN,
    GITBOOK_ASSETS_PREFIX: process.env.GITBOOK_ASSETS_PREFIX,
};

if (process.env.NODE_ENV === 'production') {
    Object.entries(gitbookRequiredEnvs).forEach(([key, value]) => {
        if (value === undefined) {
            throw new Error(
                `Environment variable ${key} is not defined while building in production mode. Please check the GitHub Actions pipeline to ensure all required ens are available.`
            );
        }
    });
}

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
        ...gitbookRequiredEnvs,
        ...gitbookOptionalEnvs,

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
