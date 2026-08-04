import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const translationsDir = join(scriptDir, '../src/intl/translations');
const outputDir = join(scriptDir, '../public/~gitbook/static/translations');

await rm(outputDir, { force: true, recursive: true });
await mkdir(outputDir, { recursive: true });

const translationFiles = (await readdir(translationsDir))
    .filter(
        (file) =>
            file.endsWith('.ts') &&
            !file.endsWith('.test.ts') &&
            !['index.ts', 'server.ts', 'types.ts'].includes(file)
    )
    .sort();

for (const file of translationFiles) {
    const locale = file.slice(0, -'.ts'.length);
    const exportName = locale.replaceAll('-', '_');
    const module = await import(pathToFileURL(join(translationsDir, file)).href);
    const translation = module[exportName];

    if (!translation || typeof translation !== 'object') {
        throw new Error(`Translation module ${file} does not export ${exportName}`);
    }

    await writeFile(join(outputDir, `${locale}.json`), `${JSON.stringify(translation)}\n`);
}
