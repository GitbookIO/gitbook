import { init } from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    init({
        dsn,
        release: process.env.SENTRY_RELEASE,

        // Disable tracing as it creates additional requests in an env where subrequests are limited.
        tracesSampleRate: 0,

        // Disable transactions  as it creates additional requests in an env where subrequests are limited.
        // https://docs.sentry.io/platforms/node/configuration/filtering/#using--3
        beforeSendTransaction: () => {
            return null;
        },
    });
}

export * from '@sentry/nextjs';
