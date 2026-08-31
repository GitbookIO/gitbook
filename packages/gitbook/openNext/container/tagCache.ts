import type { NextModeTagCache, NextModeTagCacheWriteInput } from '@opennextjs/aws/types/overrides';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

import { internalFetch } from './fetch';
import { CACHE_ORIGIN, CACHE_PATH, type WriteTagsPayload } from './protocol';

export default {
    name: 'GitbookContainerTagCache',
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

        const payload: WriteTagsPayload = { tags: tagsToWrite };

        try {
            await internalFetch(new URL(CACHE_PATH.writeTags, CACHE_ORIGIN), {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Failed to write tags to cache worker', error);
        }
    },
} satisfies NextModeTagCache;
