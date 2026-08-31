import { getCloudflareContext as getCloudflareContextV2 } from '@/lib/data/cloudflare';
import { GITBOOK_RUNTIME } from '@/lib/env';

let pendings: Promise<unknown>[] = [];

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

    if (GITBOOK_RUNTIME === 'cloudflare') {
        const context = getCloudflareContextV2();
        if (context) {
            context.ctx.waitUntil(promise);
            return;
        }

        // The container tier shares the Cloudflare build but runs as a long-lived Node server,
        // where a detached promise keeps running after the response is sent.
        promise.catch((error) => {
            console.error('Ignored error in waitUntil', error);
        });
        return;
    }

    await promise.catch((error) => {
        console.error('Ignored error in waitUntil', error);
    });
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
