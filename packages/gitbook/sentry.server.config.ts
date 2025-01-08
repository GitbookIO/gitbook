import { init } from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    init({
        dsn,
        // Disable tracing as it creates additional requests in an env where subrequests are limited.
        tracesSampleRate: 0,
    });
}
