/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // TODO: Until we get all the API typing
        ignoreBuildErrors: true,
    },
    env: {
        BUILD_VERSION: (process.env.GITHUB_SHA ?? '').slice(0, 7),
    },
};

module.exports = nextConfig;
