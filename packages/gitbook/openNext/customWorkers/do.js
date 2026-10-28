// This worker only purposes it to host the different DO that we will need in the other workers.
import { DurableObject } from 'cloudflare:workers';

// `use cache` could cause multiple writes to the same key to happen concurrently, there is a limit of 1 write per key/second
// so we need to buffer writes to the R2 bucket to avoid hitting this limit.
export class R2WriteBuffer extends DurableObject {
    writePromise;

    async write(cacheKey, value) {
        // We are already writing to this key
        if (this.writePromise) {
            return;
        }

        this.writePromise = this.env.NEXT_INC_CACHE_R2_BUCKET.put(cacheKey, value);
        this.ctx.waitUntil(
            this.writePromise.finally(() => {
                this.writePromise = undefined;
            })
        );
    }
}

export { DOQueueHandler } from '../../.open-next/.build/durable-objects/queue.js';

export { DOShardedTagCache } from '../../.open-next/.build/durable-objects/sharded-tag-cache.js';

export default {
    async fetch() {
        // This worker does not handle any requests, it only provides Durable Objects
        return new Response('This worker is not meant to handle requests directly', {
            status: 400,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    },
};
