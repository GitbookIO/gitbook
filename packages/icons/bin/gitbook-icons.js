#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const { getKitPath } = require('./kit');

const allStyles = ['brands', 'duotone', 'solid', 'regular', 'light', 'thin', 'custom-icons'];

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/icons');
    const stylesToCopy = (process.argv[3] ? process.argv[3].split(',') : allStyles).filter(
        (style) => allStyles.includes(style),
    );
    const source = getKitPath();

    // Create the output folder if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    const printOutputFolder = path.relative(process.cwd(), outputFolder);
    console.log(`🚚 Copying icons of styles ${stylesToCopy.join(', ')} to ${printOutputFolder}`);

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
        )
    ]);

    console.log(`🎉 Icons copied to ${printOutputFolder}`);
}

main().catch(console.error);
