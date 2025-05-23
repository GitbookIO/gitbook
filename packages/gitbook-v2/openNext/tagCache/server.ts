import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
    MIDDLEWARE_REFERENCE?: Pick<
        NextModeTagCache,
        'getLastRevalidated' | 'hasBeenRevalidated' | 'writeTags' | 'getPathsByTags'
    >;
}

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    getLastRevalidated: async (tags: string[]) => {
        const { env } = getCloudflareContext();
        return (env as Env).MIDDLEWARE_REFERENCE?.getLastRevalidated(tags) ?? 0;
    },
    hasBeenRevalidated: async (tags: string[]) => {
        const { env } = getCloudflareContext();
        return (env as Env).MIDDLEWARE_REFERENCE?.hasBeenRevalidated(tags) ?? false;
    },
    writeTags: async (tags: string[]) => {
        const { env } = getCloudflareContext();
        (env as Env).MIDDLEWARE_REFERENCE?.writeTags(tags);
    },
} satisfies NextModeTagCache;
