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
}
   
export default nextConfig;
