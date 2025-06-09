import { getCloudflareContext as getCloudflareContextOpenNext } from '@opennextjs/cloudflare';
import { cache } from 'react';
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

export function getCloudflareRequestGlobal() {
    const context = getCloudflareContext();
    if (!context) {
        return cache(() => ({}));
    }

    return context.cf;
}
