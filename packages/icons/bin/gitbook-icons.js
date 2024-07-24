#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const { getKitPath } = require('./kit');

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/icons');
    const source = getKitPath();

    // Create the output folder if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    // Copy the assets from
    // source/sprites to outputFolder/sprites
    // source/svgs to outputFolder/svgs
    await Promise.all([
        fs.cp(path.join(source, 'icons/sprites'), path.join(outputFolder, 'sprites'), {
            recursive: true,
        }),
        fs.cp(path.join(source, 'icons/svgs'), path.join(outputFolder, 'svgs'), {
            recursive: true,
        }),
    ]);

    console.log(`🎉 Icons copied to ${outputFolder}`);
}

main().catch(console.error);
