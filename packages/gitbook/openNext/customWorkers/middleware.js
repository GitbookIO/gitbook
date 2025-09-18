import { WorkerEntrypoint } from 'cloudflare:workers';
import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

import { handler as middlewareHandler } from '../../.open-next/middleware/handler.mjs';

export { DOQueueHandler } from '../../.open-next/.build/durable-objects/queue.js';

export { DOShardedTagCache } from '../../.open-next/.build/durable-objects/sharded-tag-cache.js';

//Format used by the tail logger
const formatLog = (requestDuration, responseCode, responseCache, responseRoute) =>
    `%${JSON.stringify({ requestDuration, responseCode, responseCache, responseRoute })}%[main] Response Done`;

const getResolvedRoute = (reqOrResp, defaultValue) => {
    try {
        const resolvedRoutes = JSON.parse(
            reqOrResp.headers.get('x-opennext-resolved-routes') ?? ''
        )[0].route;
        return resolvedRoutes ?? defaultValue;
    } catch {
        return defaultValue;
    }
};

export default class extends WorkerEntrypoint {
    async fetch(request) {
        return runWithCloudflareRequestContext(request, this.env, this.ctx, async () => {
            const startTime = Date.now();
            const middlewareRequest = new Request(request.url, request);
            middlewareRequest.headers.set('x-open-next-continent', request.cf?.continent || '');
            // - `Request`s are handled by the Next server
            const reqOrResp = await middlewareHandler(middlewareRequest, this.env, this.ctx);
            if (reqOrResp instanceof Response) {
                const duration = Date.now() - startTime;
                const logMessage = formatLog(
                    duration,
                    reqOrResp.status,
                    reqOrResp.headers.get('x-opennext-cache') ?? 'MISS',
                    getResolvedRoute(reqOrResp, 'middleware')
                );
                // biome-ignore lint/suspicious/noConsole: <explanation>
                console.log(logMessage);
                return reqOrResp;
            }

            if (this.env.STAGE !== 'preview') {
                // https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/#version-affinity
                reqOrResp.headers.set(
                    'Cloudflare-Workers-Version-Overrides',
                    `gitbook-open-v2-${this.env.STAGE}="${this.env.WORKER_VERSION_ID}"`
                );
                const response = await this.env.DEFAULT_WORKER?.fetch(reqOrResp, {
                    redirect: 'manual',
                    cf: {
                        cacheEverything: false,
                    },
                });
                const formatedLog = formatLog(
                    Date.now() - startTime,
                    response.status,
                    `SERVER-${response.headers.get('x-nextjs-cache') ?? 'MISS'}`,
                    getResolvedRoute(reqOrResp, 'unresolved')
                );
                // biome-ignore lint/suspicious/noConsole: <explanation>
                console.log(formatedLog);

                return response;
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
