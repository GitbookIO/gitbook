import * as Sentry from '@sentry/nextjs';
import { Instrumentation } from 'next';

export async function register() {
    console.log('Instrumentation.register');
    await import('../sentry.edge.config');
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
    console.log('Instrumentation.onRequestError');
    Sentry.captureRequestError(...args);
    // There is an issue on Cloudflare that requires us to flush the events manually.
    // https://github.com/getsentry/sentry-javascript/issues/14931#issuecomment-2577640023
    await Sentry.flush();
};
