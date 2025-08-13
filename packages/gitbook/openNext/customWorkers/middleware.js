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
                // https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/#version-affinity
                reqOrResp.headers.set(
                    'Cloudflare-Workers-Version-Overrides',
                    `gitbook-open-v2-${this.env.STAGE}="${this.env.WORKER_VERSION_ID}"`
                );
                return this.env.DEFAULT_WORKER?.fetch(reqOrResp, {
                    redirect: 'manual',
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
                // We never want to follow the redirects here.
                // Redirects are supposed to happen from the client.
                redirect: 'manual',
                cf: {
                    cacheEverything: false,
                },
            });
        });
    }
}
