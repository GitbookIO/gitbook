#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import url from 'url';

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/math');
    const source = path.dirname(url.fileURLToPath(import.meta.resolve('tm-grammars/package.json')));

    // Create the output folder if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    // Copy the assets
    await Promise.all([
        fs.cp(path.join(source, 'grammars'), outputFolder, {
            recursive: true,
        }),
    ]);

    console.log(`🎉 TM Grammars assets copied to ${outputFolder}`);
}

main().catch(console.error);
