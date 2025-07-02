import { trace } from '@/lib/tracing';
import type { Queue } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';

export default {
    name: 'GitbookISRQueue',
    send: (msg) => {
        return trace({ operation: 'gitbookISRQueueSend', name: msg.MessageBody.url }, () => {
            const { ctx } = getCloudflareContext();
            ctx.waitUntil(doQueue.send(msg));
        });
    },
} satisfies Queue;
