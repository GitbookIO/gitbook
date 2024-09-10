import { init } from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    init({
        debug: false,
        dsn,

        sampleRate: 0.1,

        // Disable tracing as it creates additional requests in an env where subrequests are limited.
        enableTracing: false,

        // Disable transactions  as it creates additional requests in an env where subrequests are limited.
        // https://docs.sentry.io/platforms/node/configuration/filtering/#using--3
        beforeSendTransaction: () => {
            return null;
        },
    });
}
