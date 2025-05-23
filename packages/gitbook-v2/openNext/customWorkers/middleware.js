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

            if (this.env.STAGE !== 'preview') {
                return this.env.DEFAULT_WORKER?.fetch(reqOrResp, {
                    cf: {
                        cacheEverything: false,
                    },
                });
            }
            // If we are in preview mode, we need to send the request to the preview URL
            const modifiedUrl = new URL(reqOrResp.url);
            modifiedUrl.hostname = this.env.PREVIEW_HOSTNAME;
            const nextRequest = new Request(modifiedUrl, reqOrResp);
            return fetch(nextRequest, {
                cf: {
                    cacheEverything: false,
                },
            });
        });
    }

    //TODO: Add methods for the DO queue and sharded tag cache so that they can be used in the main function through service bindings
}
