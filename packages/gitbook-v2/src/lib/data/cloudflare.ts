import { getCloudflareContext as getCloudflareContextOpenNext } from '@opennextjs/cloudflare';

/**
 * Load the cloudflare context.
 * This is a workaround to avoid webpack trying to bundle this cloudflare only module.
 */
export async function getCloudflareContext(): Promise<{
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
} | null> {
    try {
        // @ts-ignore
        return await getCloudflareContextOpenNext();
    } catch (error) {
        if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
            throw error;
        }
    }

    return null;
    // try {
    //     // HACK: This is a workaround to avoid webpack trying to bundle this cloudflare only module
    //     // @ts-ignore
    //     const cloudflareContext = await import(
    //         /* webpackIgnore: true */ `${'__cloudflare:workers'.replaceAll('_', '')}`
    //     );
    //     return cloudflareContext;
    // } catch (error) {
    //     if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    //         throw error;
    //     }
    // }
    // return null;
}
