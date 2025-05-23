import { runWithCloudflareRequestContext } from '../../.open-next/cloudflare/init.js';

import { handler } from '../../.open-next/server-functions/default/handler.mjs';

export default {
    async fetch(request, env, ctx) {
        return runWithCloudflareRequestContext(request, env, ctx, async () => {
            // - `Request`s are handled by the Next server
            return handler(request, env, ctx);
        });
    },
};
