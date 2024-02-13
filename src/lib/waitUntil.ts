import { getRequestContext } from '@cloudflare/next-on-pages';

const cloudflareRequestContextSymbol = Symbol.for('__cloudflare-request-context__');

/**
 * Get a global context object for the current request.
 * This object can be used as a key to store request-specific data in a WeakMap.
 */
export function getGlobalContext(): object {
    // See https://github.com/cloudflare/next-on-pages/discussions/596#discussioncomment-8450986
    // we need a reliable object that will be different per request
    const cloudflareRequestContext = (
        globalThis as unknown as {
            [cloudflareRequestContextSymbol]: object;
        }
    )[cloudflareRequestContextSymbol];

    return cloudflareRequestContext ?? globalThis;
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
