import { getOptionalRequestContext } from '@cloudflare/next-on-pages';
import type { ExecutionContext, IncomingRequestCfProperties } from '@cloudflare/workers-types';

let pendings: Array<Promise<unknown>> = [];

/**
 * Get a global context object for the current execution.
 * This object can be used to store data that should be shared between the middleware and the handler
 * and re-used for all requests.
 */
export function getGlobalContext(): ExecutionContext | object {
    if (process.env.NODE_ENV === 'test') {
        // Do not try loading the next-on-pages package in tests as it'll fail
        return globalThis;
    }

    // We lazy-load the next-on-pages package to avoid errors when running tests because of 'server-only'.
    // const { getOptionalRequestContext } = await import('@cloudflare/next-on-pages');
    return getOptionalRequestContext()?.ctx ?? globalThis;
}

/**
 * Get a global context object for the current request.
 * This object can be used as a key to store request-specific data in a WeakMap.
 */
export function getRequestContext(): IncomingRequestCfProperties | object {
    if (process.env.NODE_ENV === 'test') {
        // Do not try loading the next-on-pages package in tests as it'll fail
        return globalThis;
    }

    // We lazy-load the next-on-pages package to avoid errors when running tests because of 'server-only'.
    return getOptionalRequestContext()?.cf ?? globalThis;
}

/**
 * Extend the lifetime of the event handler until the promise is resolved.
 * https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil
 */
export async function waitUntil(promise: Promise<unknown>) {
    if (process.env.NODE_ENV === 'test') {
        pendings.push(promise);
        promise.finally(() => {
            pendings = pendings.filter((p) => p !== promise);
        });

        return;
    }

    const cloudflareContext = getGlobalContext();
    if ('waitUntil' in cloudflareContext) {
        cloudflareContext.waitUntil(promise);
    } else {
        await promise;
    }
}

/**
 * Wait for all promises that have been passed to waitUntil to resolve.
 */
export async function flushWaitUntil() {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('flushWaitUntil is only available in test environment');
    }

    const result = await Promise.all(pendings);
    pendings = [];

    return result;
}
