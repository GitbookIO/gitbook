import type { OpenNextConfig } from '@opennextjs/cloudflare';

export default {
    default: {
        override: {
            wrapper: 'node',
            converter: 'node',
            proxyExternalRequest: 'node',
            generateDockerfile: true,
            queue: 'dummy',
            incrementalCache: () => import('./openNext/noOpCache').then((m) => m.default),
            tagCache: 'dummy',
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
    cloudflare: {
        dangerousDisableConfigValidation: true,
    },
} satisfies OpenNextConfig;
