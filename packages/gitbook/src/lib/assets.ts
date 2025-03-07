import { GITBOOK_ASSETS_URL } from '@v2/lib/env';

/**
 * Create a public URL for an asset.
 */
export function getAssetURL(path: string): string {
    return `${GITBOOK_ASSETS_URL || ''}/~gitbook/static/${path}`;
}
