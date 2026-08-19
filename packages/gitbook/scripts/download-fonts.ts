import { copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import sourcesData from '../src/fonts/generated/sources.json' with { type: 'json' };
import type { FontSourcesData } from '../src/fonts/types';

const CONCURRENCY = 8;
const ATTEMPTS = 3;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(scriptDir, '../src/fonts');
const outputDir = join(scriptDir, '../public/~gitbook/static/fonts');

const sources = new Map(Object.entries(sourcesData as FontSourcesData));

// Faces move between releases; stale files would otherwise pile up in the deployed assets.
await mkdir(outputDir, { recursive: true });
for (const entry of await readdir(outputDir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) {
        const file = relative(outputDir, join(entry.parentPath, entry.name));
        if (!sources.has(file)) {
            await rm(join(outputDir, file));
        }
    }
}

const pending = [...sources].filter(([file]) => !Bun.file(join(outputDir, file)).size);
if (pending.length > 0) {
    console.log(`Downloading ${pending.length} font files…`);
}

const queue = pending.values();
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

async function worker() {
    for (const [file, source] of queue) {
        const target = join(outputDir, file);
        await mkdir(dirname(target), { recursive: true });

        if (source.startsWith('./')) {
            await copyFile(join(fontsDir, source), target);
            continue;
        }

        await writeFile(target, await fetchWithRetries(source));
    }
}

// Google Fonts intermittently refuses connections when a build asks for hundreds of files at once,
// and a single miss fails the whole build.
async function fetchWithRetries(url: string): Promise<Buffer> {
    for (let attempt = 1; ; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            if (attempt >= ATTEMPTS) {
                throw new Error(`Unable to download ${url}: ${error}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
        }
    }
}
