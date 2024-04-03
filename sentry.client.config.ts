import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    Sentry.init({
        debug: false,
        dsn,
        integrations: [],
        sampleRate: 0.1,
        enableTracing: false,
        beforeSendTransaction: () => {
            return null;
        },
    });
}
