/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // TODO: Until we get all the API typing
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
