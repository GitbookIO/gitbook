import { getRequestCloudflareContext } from '@cloudflare/next-on-pages/helpers';

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
