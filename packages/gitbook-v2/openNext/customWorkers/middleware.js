import { WorkerEntrypoint } from 'cloudflare:workers';
import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

import { handler as middlewareHandler } from '../../.open-next/middleware/handler.mjs';

export { DOQueueHandler } from '../../.open-next/.build/durable-objects/queue.js';

export { DOShardedTagCache } from '../../.open-next/.build/durable-objects/sharded-tag-cache.js';

export default class extends WorkerEntrypoint {
    async fetch(request) {
        return runWithCloudflareRequestContext(request, this.env, this.ctx, async () => {
            // - `Request`s are handled by the Next server
            const reqOrResp = await middlewareHandler(request, this.env, this.ctx);
            if (reqOrResp instanceof Response) {
                return reqOrResp;
            }

            // If it is a `Request`, we need to send it to the Next server
            // But we need to send it using the preview URL if we are in preview mode
            const nextRequest = reqOrResp;

            // We always pass the version ID so that it always fetch from the correct version
            nextRequest.headers.set('Cloudflare-Workers-Version-Overrides', this.env.VERSION_ID);

            return this.env.DEFAULT_WORKER?.fetch(nextRequest, {
                cf: {
                    cacheEverything: false,
                },
            });
        });
    }

    //TODO: Add methods for the DO queue and sharded tag cache so that they can be used in the main function through service bindings
}
