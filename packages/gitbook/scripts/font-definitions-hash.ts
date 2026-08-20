import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function getFontDefinitionsHash(): Promise<string> {
    const path = join(dirname(fileURLToPath(import.meta.url)), '../src/fonts/definitions.ts');
    return createHash('sha256')
        .update(await readFile(path))
        .digest('hex');
}
