// @ts-ignore
import nextOnPagesHandler from '@cloudflare/next-on-pages/fetch-handler';

import { withResponseCacheTags } from './lib/cache/response';
import { withMiddlewareHeadersStorage } from './lib/middleware';

/**
 * We use a custom entrypoint until we can move to opennext (https://github.com/opennextjs/opennextjs-cloudflare/issues/92).
 * There is a bug in next-on-pages where headers can't be set on the response in the middleware for RSC requests (https://github.com/cloudflare/next-on-pages/issues/897).
 */
export default {
    async fetch(request, env, ctx) {
        const response = await withResponseCacheTags(() =>
            withMiddlewareHeadersStorage(() => nextOnPagesHandler.fetch(request, env, ctx))
        );

        return response;
    },
} as ExportedHandler<{ ASSETS: Fetcher }>;
