import { trace } from '@/lib/tracing';
import type { Queue } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

interface Env {
    STAGE?: string;
}

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        return trace({ operation: 'gitbookISRQueueSend', name: msg.MessageBody.url }, async () => {
            const { ctx, env } = getCloudflareContext();
            const hasDurableObject =
                (env as Env).STAGE !== 'dev' && (env as Env).STAGE !== 'preview';
            ctx.waitUntil(hasDurableObject ? memoryQueue.send(msg) : doQueue.send(msg));
        });
    },
} satisfies Queue;
