import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Get the global context object for the current request.
 */
export function getGlobalContext(): object {
    return getCloudflareContext()?.ctx ?? globalThis;
}

/**
 * Extend the lifetime of the event handler until the promise is resolved.
 * https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil
 */
export async function waitUntil(promise: Promise<unknown>) {
    const cloudflare = getCloudflareContext();
    if (cloudflare) {
        cloudflare.ctx.waitUntil(promise);
    } else {
        await promise;
    }
}

function getCloudflareContext() {
    try {
        const cloudflare = getRequestContext();
        return cloudflare;
    } catch (error) {
        return null;
    }
}
