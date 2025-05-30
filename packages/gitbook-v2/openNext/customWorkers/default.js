import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

export default {
    async fetch(request, env, ctx) {
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
            // We can't move the handler import to the top level, otherwise the runtime will not be properly initialized
            const { handler } = await import(
                '../../.open-next/server-functions/default/handler.mjs'
            );

            // - `Request`s are handled by the Next server
            return handler(request, env, ctx);
        });
    },
};
