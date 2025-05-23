import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

import { handler } from '../../.open-next/server-functions/default/handler.mjs';

export default {
    async fetch(request, env, ctx) {
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
            // - `Request`s are handled by the Next server
            console.log('Request URL:', request);
            if (request.url.includes('404')) {
                await env.MIDDLEWARE_REFERENCE.send('whatever');
            }
            return handler(request, env, ctx);
        });
    },
};
