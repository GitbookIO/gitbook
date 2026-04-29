#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

import { allStyles, collectNormalizedIconAssets, createMetricsManifest } from './icon-assets.js';
import { getKitPath } from './kit.js';

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/icons');
    const stylesToCopy = (process.argv[3] ? process.argv[3].split(',') : allStyles).filter(
        (style) => allStyles.includes(style)
    );
    const source = getKitPath();
    const iconAssets = await collectNormalizedIconAssets(source, stylesToCopy);

    // Create the output folder if it doesn't exist
    await Promise.all([
        fs.mkdir(outputFolder, { recursive: true }),
        ...stylesToCopy.map((style) =>
            fs.mkdir(path.join(outputFolder, 'svgs', style), { recursive: true })
        ),
        fs.mkdir(path.join(outputFolder, 'sprites'), { recursive: true }),
    ]);

    // Write normalized SVG assets and copy style sprites.
    await Promise.all([
        ...iconAssets.map((asset) =>
            fs.writeFile(
                path.join(outputFolder, 'svgs', asset.style, `${asset.icon}.svg`),
                asset.svg
            )
        ),
        ...stylesToCopy.map((style) => {
            const spritePath = path.join(source, 'sprites', `${style}.svg`);
            return fs
                .access(spritePath)
                .then(() => fs.cp(spritePath, path.join(outputFolder, 'sprites', `${style}.svg`)));
        }),
        fs.writeFile(
            path.join(outputFolder, 'metrics.json'),
            JSON.stringify(createMetricsManifest(iconAssets))
        ),
    ]);

    // biome-ignore lint/suspicious/noConsole: We want the CLI to log
    console.log(
        `Copied ${iconAssets.length} icons across ${stylesToCopy.length} styles to ${outputFolder}`
    );
}

main().catch((error) => {
    console.error(`Error copying icons: ${error}`);
    process.exit(1);
});
