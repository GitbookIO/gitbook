import { build } from 'bun';
import { mkdir, rename, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MERMAID_RUNTIME_PATH } from '../src/components/DocumentView/CodeBlock/mermaid-runtime-path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, '../public/~gitbook/static/mermaid');
const temporaryDir = join(outputDir, '.build');
const require = createRequire(import.meta.url);
const mermaidPackage = require('mermaid/package.json') as { version: string };
const zenumlPackage = require('@mermaid-js/mermaid-zenuml/package.json') as { version: string };

// The runtime URL is served as immutable, it has to change whenever the bundled versions change.
if (
    MERMAID_RUNTIME_PATH !==
    `mermaid/mermaid@${mermaidPackage.version}-zenuml@${zenumlPackage.version}.mjs`
) {
    throw new Error(
        'Update MERMAID_RUNTIME_PATH for the installed mermaid and @mermaid-js/mermaid-zenuml versions'
    );
}

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
