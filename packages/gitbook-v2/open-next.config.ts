// default open-next.config.ts file created by @opennextjs/cloudflare

import cache from '@opennextjs/cloudflare/kvCache';

const config = {
    default: {
        override: {
            wrapper: 'cloudflare-node',
            converter: 'edge',
            incrementalCache: async () => cache,
            tagCache: 'dummy',
            queue: 'dummy',
        },
    },

    middleware: {
        external: true,
        override: {
            wrapper: 'cloudflare-edge',
            converter: 'edge',
            proxyExternalRequest: 'fetch',
        },
    },

    dangerous: {
        enableCacheInterception: false,
    },

    experimental: {
        serverActions: {
            allowedOrigins: process.env.GITBOOK_URL
                ? [new URL(process.env.GITBOOK_URL).hostname]
                : [],
        },
    },
};

export default config;
