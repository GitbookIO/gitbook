import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    Sentry.init({
        dsn,
        tracesSampleRate: 1,
        debug: false,
        integrations: [],
    });
}
