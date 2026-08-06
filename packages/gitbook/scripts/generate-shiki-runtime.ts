import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'bun';
import { bundledLanguagesInfo } from 'shiki/langs';

import { SHIKI_RUNTIME_PATH } from '../src/components/DocumentView/CodeBlock/shiki-runtime-path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = join(scriptDir, '../public/~gitbook/static/shiki');
const temporaryDir = join(outputDir, '.build');
const shikiPackage = createRequire(import.meta.url)('shiki/package.json') as { version: string };

if (SHIKI_RUNTIME_PATH !== `shiki/shiki@${shikiPackage.version}.mjs`) {
    throw new Error('Update SHIKI_RUNTIME_PATH for the installed shiki version');
}

await rm(outputDir, { force: true, recursive: true });
await mkdir(temporaryDir, { recursive: true });

const runtimeResult = await build({
    entrypoints: [join(scriptDir, 'shiki-runtime.ts')],
    format: 'esm',
    minify: true,
    outdir: temporaryDir,
    target: 'browser',
});

const [runtime] = runtimeResult.outputs;
if (!runtimeResult.success || !runtime || runtimeResult.outputs.length !== 1) {
    throw new Error(`Unable to build Shiki runtime: ${runtimeResult.logs.join('\n')}`);
}

const languageAliases = Object.fromEntries(
    bundledLanguagesInfo.flatMap(({ id, aliases = [] }) => [
        [id, id],
        ...aliases.map((alias) => [alias, id]),
    ])
);
const languageResult = await build({
    entrypoints: bundledLanguagesInfo.map(({ id }) => `@shikijs/langs/${id}`),
    format: 'esm',
    minify: true,
    naming: '[name].mjs',
    outdir: join(temporaryDir, 'langs'),
    target: 'browser',
});

if (!languageResult.success || languageResult.outputs.length !== bundledLanguagesInfo.length) {
    throw new Error(`Unable to build Shiki languages: ${languageResult.logs.join('\n')}`);
}

await rename(runtime.path, join(outputDir, SHIKI_RUNTIME_PATH.replace('shiki/', '')));
await rename(join(temporaryDir, 'langs'), join(outputDir, 'langs'));
await writeFile(
    join(outputDir, 'languages.mjs'),
    `export default ${JSON.stringify(languageAliases)};\n`
);
await rm(temporaryDir, { force: true, recursive: true });
