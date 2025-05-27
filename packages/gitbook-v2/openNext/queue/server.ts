import type { Queue } from '@opennextjs/aws/types/overrides.js';
// import { getCloudflareContext } from '@opennextjs/cloudflare';

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface Env {
    MIDDLEWARE_REFERENCE?: Pick<Queue, 'send'>;
}

export default {
    name: 'GitbookISRQueue',
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    send: async (msg) => {
        //TODO: Re add this
        // const { env, ctx } = getCloudflareContext();
        // ctx.waitUntil((env as Env).MIDDLEWARE_REFERENCE?.send(msg) ?? Promise.resolve());
    },
} satisfies Queue;
