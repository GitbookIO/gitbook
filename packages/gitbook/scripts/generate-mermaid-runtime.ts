import { mkdir, rename, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'bun';

import { MERMAID_RUNTIME_PATH } from '../src/components/DocumentView/CodeBlock/mermaid-runtime-path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, '../public/~gitbook/static/mermaid');
const temporaryDir = join(outputDir, '.build');

await rm(outputDir, { force: true, recursive: true });
await mkdir(temporaryDir, { recursive: true });

const result = await build({
    entrypoints: [join(scriptDir, 'mermaid-runtime.ts')],
    format: 'esm',
    minify: true,
    outdir: temporaryDir,
    target: 'browser',
});

const [output] = result.outputs;
if (!result.success || !output || result.outputs.length !== 1) {
    throw new Error(`Unable to build Mermaid runtime: ${result.logs.join('\n')}`);
}

const outputPath = join(outputDir, MERMAID_RUNTIME_PATH.replace('mermaid/', ''));
await rename(output.path, outputPath);
await rm(temporaryDir, { force: true, recursive: true });
