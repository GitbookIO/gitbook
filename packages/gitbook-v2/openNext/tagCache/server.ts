import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';

// interface Env {
//     MIDDLEWARE_REFERENCE?: Pick<
//         NextModeTagCache,
//         'getLastRevalidated' | 'hasBeenRevalidated' | 'writeTags' | 'getPathsByTags'
//     >;
// }

//TODO: Reenable all of this.
export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    getLastRevalidated: async (_tags: string[]) => {
        return 0;
        // try {
        //     const { env } = getCloudflareContext();
        //     return (env as Env).MIDDLEWARE_REFERENCE?.getLastRevalidated(tags) ?? 0;
        // } catch (error) {
        //     console.error('Server - Error getting last revalidated tags:', error);
        //     return 0; // Fallback to 0 if there's an error
        // }
    },
    hasBeenRevalidated: async (_tags: string[]) => {
        // try {
        //     const { env } = getCloudflareContext();
        //     return (env as Env).MIDDLEWARE_REFERENCE?.hasBeenRevalidated(tags) ?? false;
        // } catch (error) {
        //     console.error('Server - Error checking if tags have been revalidated:', error);
        //     return false; // Fallback to false if there's an error
        // }
        return false;
    },
    writeTags: async (_tags: string[]) => {
        // try {
        //     const { env } = getCloudflareContext();
        //     (env as Env).MIDDLEWARE_REFERENCE?.writeTags(tags);
        // } catch (error) {
        //     console.error('Server - Error writing tags:', error);
        // }
        return;
    },
} satisfies NextModeTagCache;
