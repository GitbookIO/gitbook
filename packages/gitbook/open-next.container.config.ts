import type { OpenNextConfig } from '@opennextjs/aws/types/open-next.js';

/**
 * Build config for the container server tier: the same Next.js app packaged by `@opennextjs/aws`
 * as a plain Node server, run inside a Cloudflare Container.
 *
 * The Cloudflare middleware worker stays the front door, so `middleware.external` mirrors
 * `open-next.config.ts` and the middleware bundle emitted here is unused.
 */
export default {
    default: {
        override: {
            wrapper: 'node',
            converter: 'node',
            // We ship our own Dockerfile (openNext/customWorkers/Dockerfile).
            generateDockerfile: false,
            queue: () => import('./openNext/container/queue').then((m) => m.default),
            incrementalCache: () =>
                import('./openNext/container/incrementalCache').then((m) => m.default),
            tagCache: () => import('./openNext/container/tagCache').then((m) => m.default),
        },
    },
    middleware: {
        external: true,
    },
    dangerous: {
        enableCacheInterception: true,
    },
    edgeExternals: ['node:crypto'],
} satisfies OpenNextConfig;
