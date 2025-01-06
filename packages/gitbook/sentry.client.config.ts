import {
    BrowserClient,
    makeFetchTransport,
    defaultStackParser,
    getCurrentScope,
} from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
    // To tree shake default integrations that we don't use
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/#tree-shaking-default-integrations
    const client = new BrowserClient({
        debug: false,
        dsn,
        integrations: [],
        sampleRate: 0.1,
        enableTracing: false,
        beforeSendTransaction: () => {
            return null;
        },
        transport: makeFetchTransport,
        stackParser: defaultStackParser,
    });

    getCurrentScope().setClient(client);
    client.init();
}
