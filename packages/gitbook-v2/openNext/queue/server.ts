import type { Queue } from '@opennextjs/aws/types/overrides.js';

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        // We should never reach this point in the server. If that's the case, we should log it.
        console.warn('GitbookISRQueue: send called on server side, this should not happen.', msg);
    },
} satisfies Queue;
