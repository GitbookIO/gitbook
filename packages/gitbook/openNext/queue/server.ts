import type { Queue } from '@opennextjs/aws/types/overrides.js';
import { getLogger } from '@v2/lib/logger';

export default {
    name: 'GitbookISRQueue',
    send: async (msg) => {
        const logger = getLogger().subLogger('GitbookISRQueue');
        // We should never reach this point in the server. If that's the case, we should log it.
        logger.warn('send called on server side, this should not happen.', msg);
    },
} satisfies Queue;
