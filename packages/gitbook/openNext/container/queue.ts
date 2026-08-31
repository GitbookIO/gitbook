import type { Queue } from '@opennextjs/aws/types/overrides.js';

import { internalFetch } from './fetch';
import { CACHE_ORIGIN, CACHE_PATH, type QueuePayload } from './protocol';

/**
 * The ISR queue Durable Object lives in the cache worker, so revalidation messages travel the same
 * outbound path as the cache itself.
 */
export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        const payload: QueuePayload = { msg };

        try {
            await internalFetch(new URL(CACHE_PATH.queue, CACHE_ORIGIN), {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Failed to send revalidation to cache worker', error);
        }
    },
} satisfies Queue;
