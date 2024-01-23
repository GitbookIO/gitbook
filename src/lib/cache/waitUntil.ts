import { getRequestCloudflareContext } from '@cloudflare/next-on-pages/helpers';

/**
 * Get the global context object for the current request.
 */
export function getGlobalContext(): object {
    const cloudflare = getRequestCloudflareContext();
    return cloudflare ?? globalThis;
}

/**
 * Extend the lifetime of the event handler until the promise is resolved.
 * https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil
 */
export async function waitUntil(promise: Promise<unknown>) {
    const cloudflare = getRequestCloudflareContext();
    if (cloudflare) {
        cloudflare.ctx.waitUntil(promise);
    } else {
        await promise;
    }
}
