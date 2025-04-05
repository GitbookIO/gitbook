import { getCloudflareContext as getCloudflareContextOpenNext } from '@opennextjs/cloudflare';

/**
 * Load the cloudflare context.
 * This is a workaround to avoid webpack trying to bundle this cloudflare only module.
 */
export function getCloudflareContext(): {
    /**
     * the worker's [bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)
     */
    env: Record<string, unknown>;

    /**
     * the request's [cf properties](https://developers.cloudflare.com/workers/runtime-apis/request/#the-cf-property-requestinitcfproperties)
     */
    cf: Record<string, unknown>;

    /**
     * the current [execution context](https://developers.cloudflare.com/workers/runtime-apis/context)
     */
    ctx: Record<string, unknown>;
} | null {
    if (process.env.NODE_ENV === 'development') {
        return null;
    }

    try {
        // @ts-ignore
        return getCloudflareContextOpenNext();
    } catch (error) {
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            throw error;
        }
    }

    return null;
}
