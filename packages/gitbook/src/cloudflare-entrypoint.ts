// @ts-ignore
import nextOnPagesHandler from '@cloudflare/next-on-pages/fetch-handler';
import { withSentry } from '@sentry/cloudflare';

import { withMiddlewareHeadersStorage } from './lib/middleware';

const exportedHandler = {
    async fetch(request, env, ctx) {
        const response = await withMiddlewareHeadersStorage(() =>
            nextOnPagesHandler.fetch(request, env, ctx),
        );

        return response;
    },
} satisfies ExportedHandler<{ ASSETS: Fetcher }>;

/**
 * We use a custom entrypoint until we can move to opennext (https://github.com/opennextjs/opennextjs-cloudflare/issues/92).
 * There is a bug in next-on-pages where headers can't be set on the response in the middleware for RSC requests (https://github.com/cloudflare/next-on-pages/issues/897).
 */
export default withSentry(
    (env) => ({
        dsn: env.SENTRY_DSN,
        release: env.SENTRY_RELEASE,
        environment: env.SENTRY_ENVIRONMENT,
        tracesSampleRate: 0,
    }),
    // @ts-ignore
    exportedHandler,
);
