import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

import { DurableObject } from 'cloudflare:workers';

//Only needed to run locally, in prod we'll use the one from do.js
export { DOShardedTagCache } from '../../.open-next/.build/durable-objects/sharded-tag-cache.js';

// Only needed to run locally, in prod we'll use the one from do.js
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

export default {
    async fetch(request, env, ctx) {
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
            // We can't move the handler import to the top level, otherwise the runtime will not be properly initialized
            const { handler } = await import(
                '../../.open-next/server-functions/default/handler.mjs'
            );

            // - `Request`s are handled by the Next server
            return handler(request, env, ctx);
        });
    },
};
