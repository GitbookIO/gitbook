#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/math');
    const source = path.dirname(url.fileURLToPath(import.meta.resolve('mathjax/package.json')));

    const packageJson = JSON.parse(await fs.readFile(path.join(source, 'package.json'), 'utf8'));

    // Create the output folder if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    // Copy the assets
    await Promise.all([
        fs.cp(path.join(source, 'es5'), path.join(outputFolder, `mathjax@${packageJson.version}`), {
            recursive: true,
        }),
    ]);
}

main().catch(console.error);
