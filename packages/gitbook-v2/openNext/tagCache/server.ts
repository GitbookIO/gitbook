import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
    MIDDLEWARE_REFERENCE?: Pick<NextModeTagCache, 'writeTags' | 'getLastRevalidated'>;
}

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    getLastRevalidated: async (tags: string[]) => {
        try {
            const { env } = getCloudflareContext();
            const lastRevalidated = await (env as Env).MIDDLEWARE_REFERENCE?.getLastRevalidated(
                tags
            );
            return lastRevalidated ?? 0; // Fallback to 0 if there's no last revalidated time
        } catch (error) {
            console.error('GitbookTagCache: Error getting last revalidated:', error);
            return 0; // Fallback to 0 if there's an error
        }
    },
    hasBeenRevalidated: async (tags: string[]) => {
        // We should never reach this point in the server. If that's the case, we should log it.
        console.warn(
            'GitbookTagCache: hasBeenRevalidated called on server side, this should not happen.',
            tags
        );
        return false;
    },
    writeTags: async (tags: string[]) => {
        try {
            const { env } = getCloudflareContext();
            (env as Env).MIDDLEWARE_REFERENCE?.writeTags(tags);
        } catch (error) {
            console.error('Server - Error writing tags:', error);
        }
    },
} satisfies NextModeTagCache;
