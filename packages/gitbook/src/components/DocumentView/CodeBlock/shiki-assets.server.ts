import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ShikiAssetLoader } from './highlighter';

const SHIKI_PREFIX = 'shiki/';

/**
 * Read a Shiki asset on the server without a network hop.
 */
export const loadShikiAssetOnServer: ShikiAssetLoader = async (path) => {
    if (!path.startsWith(SHIKI_PREFIX)) {
        throw new Error(`Not a Shiki asset: ${path}`);
    }
    // Keep `shiki` in the literal so file tracing only pulls this folder, not all of `static`.
    const file = join(
        process.cwd(),
        'public/~gitbook/static/shiki',
        path.slice(SHIKI_PREFIX.length)
    );
    return JSON.parse(await readFile(file, 'utf8'));
};
