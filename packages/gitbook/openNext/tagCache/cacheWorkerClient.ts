import type { NextModeTagCache, NextModeTagCacheWriteInput } from '@opennextjs/aws/types/overrides';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

const BINDING_NAME = 'NEXT_INC_CACHE_WORKER';

type CacheWorker = {
    writeTags(tags: NextModeTagCacheWriteInput[]): Promise<void>;
};

const getWorker = (): CacheWorker => {
    const env = getCloudflareContext().env as Record<string, unknown>;
    const worker = env[BINDING_NAME] as CacheWorker | undefined;
    if (!worker) {
        throw new Error(`Missing ${BINDING_NAME} service binding`);
    }
    return worker;
};

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    // Do nothing.
    getLastRevalidated: async () => {
        return 0;
    },
    // Return false, everything handled at the incremental cache level in the do worker.
    hasBeenRevalidated: async () => {
        return false;
    },
    writeTags: async (tags: NextModeTagCacheWriteInput[]) => {
        const tagsToWrite = tags.filter(softTagFilter);
        if (tagsToWrite.length === 0) {
            return;
        }

        await getWorker().writeTags(tagsToWrite);
    },
} satisfies NextModeTagCache;
