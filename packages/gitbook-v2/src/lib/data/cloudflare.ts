import { getCloudflareContext as getCloudflareContextOpenNext } from '@opennextjs/cloudflare';
import { GITBOOK_RUNTIME } from '../env';

/**
 * Return the Cloudflare context or null when not running in Cloudflare.
 */
export function getCloudflareContext() {
    if (GITBOOK_RUNTIME !== 'cloudflare') {
        return null;
    }

    return getCloudflareContextOpenNext();
}
