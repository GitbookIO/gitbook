import { getCloudflareContext as getCloudflareContextOpenNext } from '@opennextjs/cloudflare';

import { GITBOOK_RUNTIME } from '../env';

/**
 * Return the Cloudflare context or null when not running in Cloudflare.
 */
export function getCloudflareContext() {
    if (GITBOOK_RUNTIME !== 'cloudflare') {
        return null;
    }

    try {
        return getCloudflareContextOpenNext();
    } catch {
        // The container tier shares the Cloudflare build, but runs on plain Node with no bindings.
        return null;
    }
}
