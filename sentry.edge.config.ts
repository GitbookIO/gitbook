import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    Sentry.init({
        dsn,
        tracesSampleRate: 0.01,
        debug: false,
    });
}
