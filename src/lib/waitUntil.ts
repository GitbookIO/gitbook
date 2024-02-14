import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

/**
 * Get a global context object for the current request.
 * This object can be used as a key to store request-specific data in a WeakMap.
 */
export function getGlobalContext(): object {
    return getOptionalRequestContext() ?? globalThis;
}

/**
 * Extend the lifetime of the event handler until the promise is resolved.
 * https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil
 */
export async function waitUntil(promise: Promise<unknown>) {
    const cloudflare = getOptionalRequestContext();
    if (cloudflare) {
        cloudflare.ctx.waitUntil(promise);
    } else {
        await promise;
    }
}
