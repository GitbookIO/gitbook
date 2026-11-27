import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ShikiAssetLoader } from './highlighter';
import { getCloudflareContext } from '@/lib/data/cloudflare';

const SHIKI_PREFIX = 'shiki/';

/**
 * Read a Shiki asset on the server without a network hop.
 */
export const loadShikiAssetOnServer: ShikiAssetLoader = async (path) => {
    if (!path.startsWith(SHIKI_PREFIX)) {
        throw new Error(`Not a Shiki asset: ${path}`);
    }

    const cloudflare = getCloudflareContext();
    if (cloudflare) {
        const assets = cloudflare.env.ASSETS;
        if (!assets) {
            throw new Error('The ASSETS binding is missing on this worker');
        }
        // The host is ignored by the assets binding, only the path matters.
        const response = await assets.fetch(
            new URL(`/~gitbook/static/${path}`, 'https://assets.local')
        );
        if (!response.ok) {
            throw new Error(`Failed to read ${path} from assets: ${response.status}`);
        }
        return response.json();
    }

    // Keep `shiki` in the literal so file tracing only pulls this folder, not all of `static`.
    const file = join(
        process.cwd(),
        'public/~gitbook/static/shiki',
        path.slice(SHIKI_PREFIX.length)
    );
    return JSON.parse(await readFile(file, 'utf8'));
};
