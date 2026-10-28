import type { Queue } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        const { ctx } = getCloudflareContext();
        ctx.waitUntil(doQueue.send(msg));
    },
} satisfies Queue;
