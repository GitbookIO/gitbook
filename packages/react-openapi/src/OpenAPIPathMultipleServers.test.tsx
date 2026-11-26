import { describe, expect, it } from 'bun:test';
import { renderToReadableStream } from 'react-dom/server';

import type { OpenAPIClientContext } from './context';
import { OpenAPIPathMultipleServers } from './OpenAPIPathMultipleServers';
import { translations } from './translations';
import type { OpenAPIOperationData } from './types';

const context: OpenAPIClientContext = {
    translation: translations.en,
    icons: {
        chevronDown: null,
        chevronRight: null,
        plus: null,
        copy: null,
        check: null,
        lock: null,
        mcp: null,
        hashtag: null,
    },
    scalarRuntimeURL: '',
    $$isClientContext$$: true,
};

async function renderPath(servers: string[]) {
    const data: OpenAPIOperationData = {
        path: '/v1/devices',
        method: 'get',
        servers: servers.map((url) => ({ url })),
        operation: { responses: {} },
        securities: [],
    };
    const stream = await renderToReadableStream(
        <OpenAPIPathMultipleServers data={data} context={context} />
    );
    return new Response(stream).text();
}

describe('OpenAPIPathMultipleServers', () => {
    it('starts on its own default server after another spec that lists the same server', async () => {
        await renderPath(['https://trader.example.com', 'https://sandbox.example.com']);
        const html = await renderPath(['https://assets.example.com', 'https://trader.example.com']);

        expect(html).toContain('https://assets.example.com');
        expect(html).not.toContain('https://trader.example.com');
    });
});
