#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const { getKitPath } = require('./kit');

const stylesToCopy = ['brands', 'duotone', 'solid', 'regular', 'light'];

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
        ...stylesToCopy.map((style) =>
            fs.cp(
                path.join(source, `icons/svgs/${style}`),
                path.join(outputFolder, 'svgs', style),
                {
                    recursive: true,
                },
            ),
        ),
        ...stylesToCopy.map((style) =>
            fs.cp(
                path.join(source, `icons/sprites/${style}.svg`),
                path.join(outputFolder, 'sprites', style + '.svg'),
            ),
        ),
        // Write a version file
        fs.writeFile(
            path.join(outputFolder, 'version.txt'),
            require(path.join(source, 'package.json')).version,
        ),
    ]);

    console.log(`🎉 Icons copied to ${outputFolder}`);
}

main().catch(console.error);
