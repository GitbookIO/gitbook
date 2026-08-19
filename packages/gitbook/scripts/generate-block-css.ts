import { mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BLOCK_STYLESHEETS } from '../src/components/DocumentView/blockStylesheets';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(scriptDir, '../src');
const outputDir = join(scriptDir, '../public/~gitbook/static/css');
const tailwindCli = join(
    dirname(createRequire(import.meta.url).resolve('@tailwindcss/cli/package.json')),
    'dist/index.mjs'
);

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

for (const [name, source] of Object.entries(BLOCK_STYLESHEETS)) {
    const result = Bun.spawnSync(
        [
            'node',
            tailwindCli,
            '--input',
            join(sourceDir, source),
            '--output',
            join(outputDir, `${name}.css`),
            '--minify',
        ],
        { stdout: 'pipe', stderr: 'pipe' }
    );

    if (!result.success) {
        throw new Error(`Unable to build ${source}: ${result.stderr.toString()}`);
    }
}
