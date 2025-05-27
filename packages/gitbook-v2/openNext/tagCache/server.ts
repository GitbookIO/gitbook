import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
    MIDDLEWARE_REFERENCE?: Pick<
        NextModeTagCache,
        'writeTags' | 'getLastRevalidated' | 'hasBeenRevalidated'
    >;
}

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    // This one is used for the composable cache.
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
    // This one get called for ISR/SSG cache, if we reach here, it very likely means that we need to revalidate the page.
    // TODO: see if we could just return true.
    hasBeenRevalidated: async (tags: string[]) => {
        try {
            const { env } = getCloudflareContext();
            const hasBeenRevalidated = await (env as Env).MIDDLEWARE_REFERENCE?.hasBeenRevalidated(
                tags
            );
            return hasBeenRevalidated ?? false; // Fallback to false if there's no revalidation status
        } catch (error) {
            console.error('GitbookTagCache: Error checking revalidation:', error);
            return false; // Fallback to false if there's an error
        }
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
