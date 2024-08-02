#!/usr/bin/env node
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import { getKitPath } from './kit.js';

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
        ...stylesToCopy.map((style) => {
            const stylePath = path.join(source, 'svgs', style);
            if (!existsSync(stylePath)) {
                console.warn(`❌ Style ${style} does not exist`);
            } else {
                return fs.cp(stylePath, path.join(outputFolder, 'svgs', style), {
                    recursive: true,
                });
            }
        }),
        ...stylesToCopy.map((style) => {
            const spritePath = path.join(source, `sprites/${style}.svg`);
            if (existsSync(spritePath)) {
                return fs.cp(
                    path.join(source, `sprites/${style}.svg`),
                    path.join(outputFolder, 'sprites', style + '.svg'),
                );
            }
        }),
    ]);

    console.log(`🎉 Icons copied to ${printOutputFolder}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
