import { getLogger } from '@/lib/logger';
import type { Queue } from '@opennextjs/aws/types/overrides.js';

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        const logger = getLogger().subLogger('GitbookISRQueue');
        // We should never reach this point in the server. If that's the case, we should log it.
        logger.warn('send called on server side, this should not happen.', msg);
    },
} satisfies Queue;
