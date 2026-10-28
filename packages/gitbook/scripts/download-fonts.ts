import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { FontSourcesData } from '../src/fonts/types';
import { getFontDefinitionsHash } from './font-definitions-hash';

const CONCURRENCY = 8;
const ATTEMPTS = 6;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(scriptDir, '../src/fonts');
const outputDir = join(scriptDir, '../public/~gitbook/static/fonts');
const sourcesPath = join(fontsDir, 'generated/sources.json');

const readSources = async () => JSON.parse(await readFile(sourcesPath, 'utf8')) as FontSourcesData;

let sourcesData = await readSources();
if (sourcesData.definitionsHash !== (await getFontDefinitionsHash())) {
    console.warn(
        'definitions.ts changed since the font manifest was generated — regenerating. Commit the changes in src/fonts/generated.'
    );
    await import('./generate-font-faces');
    sourcesData = await readSources();
}

const { google, local } = sourcesData;
const sources = new Map<string, string>(Object.entries(local));
for (const [googleId, { prefix, files }] of Object.entries(google)) {
    for (const file of files) {
        sources.set(`${googleId}/${file}`, `${prefix}/${file}`);
    }
}

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
