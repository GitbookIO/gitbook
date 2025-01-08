import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    console.log('Initializing Sentry with DSN:', dsn);
    Sentry.init({
        dsn,
        // Disable tracing as it creates additional requests in an env where subrequests are limited.
        tracesSampleRate: 0,
    });
}
