import { joinPath, joinPathWithBaseURL } from './paths';
import { GITBOOK_ASSETS_URL, GITBOOK_URL } from '@/lib/env';

/**
 * Create a public URL for an asset.
 */
export function getAssetURL(path: string): string {
    return joinPathWithBaseURL(
        GITBOOK_ASSETS_URL || GITBOOK_URL,
        joinPath('~gitbook/static', path)
    );
}
