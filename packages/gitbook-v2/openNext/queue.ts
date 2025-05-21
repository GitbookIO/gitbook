import type { Queue } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

interface Env {
    IS_PREVIEW?: string;
}

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        const { ctx, env } = getCloudflareContext();
        const isPreview = (env as Env).IS_PREVIEW === 'true';
        ctx.waitUntil(isPreview ? memoryQueue.send(msg) : doQueue.send(msg));
    },
} satisfies Queue;
