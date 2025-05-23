import { WorkerEntrypoint } from 'cloudflare:workers';
import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

import onConfig from '../../.open-next/middleware/open-next.config.mjs';

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
                    headers: {
                        'Cloudflare-Workers-Version-Overrides': `gitbook-open-v2-${this.env.STAGE}="${this.env.WORKER_VERSION_ID}"`,
                    },
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

    /**
     * Forwards the message from the server to the DO queue.
     */
    async send(message) {
        return runWithCloudflareRequestContext(
            new Request('http://local'),
            this.env,
            this.ctx,
            async () => {
                const queue = await onConfig.middleware.override.queue();
                if (queue) {
                    return queue.send(message);
                }
            }
        );
    }

    /**
     * All the functions below are used to interact with the tag cache.
     * They are needed for the server who wouldn't be able to access the tag cache directly.
     */

    async getLastRevalidated() {
        return runWithCloudflareRequestContext(
            new Request('http://local'),
            this.env,
            this.ctx,
            async () => {
                const tagCache = await onConfig.middleware.override.tagCache();
                if (tagCache) {
                    return tagCache.getLastRevalidated();
                }
            }
        );
    }

    async hasBeenRevalidated() {
        return runWithCloudflareRequestContext(
            new Request('http://local'),
            this.env,
            this.ctx,
            async () => {
                const tagCache = await onConfig.middleware.override.tagCache();
                if (tagCache) {
                    return tagCache.hasBeenRevalidated();
                }
            }
        );
    }

    async writeTags(tags) {
        return runWithCloudflareRequestContext(
            new Request('http://local'),
            this.env,
            this.ctx,
            async () => {
                const tagCache = await onConfig.middleware.override.tagCache();
                if (tagCache) {
                    return tagCache.writeTags(tags);
                }
            }
        );
    }
}
