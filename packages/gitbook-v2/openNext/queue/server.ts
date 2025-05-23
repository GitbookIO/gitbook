import type { Queue } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface Env {
    MIDDLEWARE_REFERENCE?: Pick<Queue, 'send'>;
}

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        const { env, ctx } = getCloudflareContext();
        ctx.waitUntil((env as Env).MIDDLEWARE_REFERENCE?.send(msg) ?? Promise.resolve());
    },
} satisfies Queue;
