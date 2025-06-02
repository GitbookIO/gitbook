import type { OpenNextConfig } from '@opennextjs/cloudflare';

export default {
    default: {
        override: {
            wrapper: 'cloudflare-node',
            converter: 'edge',
            proxyExternalRequest: 'fetch',
            queue: () => import('./openNext/queue/middleware').then((m) => m.default),
            incrementalCache: () => import('./openNext/incrementalCache').then((m) => m.default),
            tagCache: () => import('./openNext/tagCache/middleware').then((m) => m.default),
        },
    },
    middleware: {
        external: true,
        override: {
            wrapper: 'cloudflare-edge',
            converter: 'edge',
            proxyExternalRequest: 'fetch',
            queue: () => import('./openNext/queue/middleware').then((m) => m.default),
            incrementalCache: () => import('./openNext/incrementalCache').then((m) => m.default),
            tagCache: () => import('./openNext/tagCache/middleware').then((m) => m.default),
        },
    },
    dangerous: {
        enableCacheInterception: true,
    },
    edgeExternals: ['node:crypto'],
} satisfies OpenNextConfig;
