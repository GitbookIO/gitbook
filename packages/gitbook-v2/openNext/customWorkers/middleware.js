import { DurableObject, WorkerEntrypoint } from 'cloudflare:workers';
import { runWithCloudflareRequestContext } from './cloudflare/init.js';

export { DOQueueHandler } from './cloudflare/durable-objects/queue.js';

export { DOShardedTagCache } from './cloudflare/durable-objects/sharded-tag-cache.js';

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

export default class extends WorkerEntrypoint {
    async fetch(request) {
        return runWithCloudflareRequestContext(request, this.env, this.ctx, async () => {
            const { handler: middlewareHandler } = await import(
                '../../.open-next/middleware/handler.mjs'
            );

            const url = new URL(request.url);
            console.log('Middleware URL:', url.pathname);
            if (url.pathname.startsWith('/_internal/')) {
                // Incremental cache handling
                if (url.pathname.startsWith('/_internal/set')) {
                    const { key, value, cacheType } = await request.json();
                    globalThis.incrementalCache.set(key, value, cacheType);
                    return new Response(null, {
                        status: 204,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    // biome-ignore lint/style/noUselessElse: <explanation>
                } else if (url.pathname.startsWith('/_internal/get')) {
                    const { key, cacheType } = await request.json();
                    const value = globalThis.incrementalCache.get(key, cacheType);
                    return new Response(JSON.stringify(value), {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
            }

            // - `Request`s are handled by the Next server
            const reqOrResp = await middlewareHandler(request, this.env, this.ctx);

            if (reqOrResp instanceof Response) {
                return reqOrResp;
            }

            if (this.env.STAGE === 'dev') {
                const modifiedUrl = new URL(reqOrResp.url);
                modifiedUrl.host = this.env.PREVIEW_HOSTNAME;
                console.log('Redirecting to preview hostname:', modifiedUrl.toString());
                const nextRequest = new Request(modifiedUrl, reqOrResp);
                nextRequest.headers.set('x-host', reqOrResp.host);
                return fetch(nextRequest, {
                    cf: {
                        cacheEverything: false,
                    },
                });
            }

            if (this.env.STAGE !== 'preview') {
                // https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/#version-affinity
                reqOrResp.headers.set(
                    'Cloudflare-Workers-Version-Overrides',
                    `gitbook-open-v2-${this.env.STAGE}="${this.env.WORKER_VERSION_ID}"`
                );
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
}
