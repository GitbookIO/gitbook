#!/usr/bin/env node
const { existsSync } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');

const packageJSONPath = require.resolve('@gitbook/fontawesome-pro/package.json');
const packageRoot = path.dirname(packageJSONPath);
const outputDirectory = path.resolve(__dirname, '../.generated/icon-symbols');
const metadataPath = path.join(packageRoot, 'icons', 'metadata', 'icons.json');

const supportedStyles = [
    'brands',
    'custom-icons',
    'duotone',
    'light',
    'regular',
    'sharp-duotone-solid',
    'sharp-light',
    'sharp-regular',
    'sharp-solid',
    'sharp-thin',
    'solid',
    'thin',
];

const symbolPattern = /<symbol id="([^"]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g;

async function main() {
    await fs.rm(outputDirectory, { recursive: true, force: true });
    await fs.mkdir(outputDirectory, { recursive: true });
    const iconMetadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

    await Promise.all(
        supportedStyles.map(async (style) => {
            const spritePath = path.join(packageRoot, 'icons', 'sprites', `${style}.svg`);
            if (!existsSync(spritePath)) {
                throw new Error(`Missing sprite file for "${style}": ${spritePath}`);
            }

            const sprite = await fs.readFile(spritePath, 'utf8');
            const entries = {};

            for (const match of sprite.matchAll(symbolPattern)) {
                const [, icon, viewBox, markup] = match;
                entries[icon] = {
                    viewBox,
                    markup,
                };

                const aliases = iconMetadata[icon]?.aliases?.names ?? [];
                for (const alias of aliases) {
                    if (!entries[alias]) {
                        entries[alias] = entries[icon];
                    }
                }
            }

            await fs.writeFile(
                path.join(outputDirectory, `${style}.json`),
                JSON.stringify(entries),
                'utf8'
            );
        })
    );

    // biome-ignore lint/suspicious/noConsole: CLI output is useful when regenerating manifests.
    console.log(`Generated ${supportedStyles.length} icon symbol manifests in ${outputDirectory}`);
}

main().catch((error) => {
    console.error(`Error generating icon symbols: ${error}`);
    process.exit(1);
});
