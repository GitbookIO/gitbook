#!/usr/bin/env node
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import { getKitPath } from './kit.js';

const allStyles = ['brands', 'duotone', 'solid', 'regular', 'light', 'thin', 'custom-icons'];

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/icons');
    const stylesToCopy = (process.argv[3] ? process.argv[3].split(',') : allStyles).filter(
        (style) => allStyles.includes(style)
    );
    const source = getKitPath();

    // Create the output folder if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    // Copy the assets from
    // source/sprites to outputFolder/sprites
    // source/svgs to outputFolder/svgs
    await Promise.all([
        ...stylesToCopy.map((style) => {
            const stylePath = path.join(source, 'svgs', style);
            if (!existsSync(stylePath)) {
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
                    path.join(outputFolder, 'sprites', `${style}.svg`)
                );
            }
        }),
    ]);

    // biome-ignore lint/suspicious/noConsole: We want the CLI to log
    console.log(`Copied ${stylesToCopy.length} styles to ${outputFolder}`);
}

main().catch((error) => {
    console.error(`Error copying icons: ${error}`);
    process.exit(1);
});
