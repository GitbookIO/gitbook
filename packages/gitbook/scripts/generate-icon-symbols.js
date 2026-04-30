#!/usr/bin/env node
const { existsSync } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');

const packageJSONPath = require.resolve('@gitbook/fontawesome-pro/package.json');
const packageRoot = path.dirname(packageJSONPath);
const supportedStyles = require('../src/lib/icons/supported-styles.json');
const outputDirectory = path.resolve(__dirname, '../public/~gitbook/static/icon-symbols');
const metadataPath = path.join(packageRoot, 'icons', 'metadata', 'icons.json');

const svgPattern = /<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/i;
const symbolPattern = /<symbol id="([^"]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g;
const viewBoxPattern = /\bviewBox="([^"]+)"/i;
const commentPattern = /<!--[\s\S]*?-->/g;

function sanitizeSymbolFragment(fragment) {
    return fragment.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function getSymbolId(style, icon) {
    return `gb-icon-${sanitizeSymbolFragment(style)}-${sanitizeSymbolFragment(icon)}`;
}

function buildSymbolDocumentFromSource(style, icon, source) {
    const symbolId = getSymbolId(style, icon);

    return `<svg xmlns="http://www.w3.org/2000/svg"><defs><symbol id="${symbolId}" viewBox="${source.viewBox}" overflow="visible">${source.markup}</symbol></defs><use href="#${symbolId}"/></svg>`;
}

function getSymbolSourceFromSVG(svgMarkup, style, icon) {
    const svgMatch = svgMarkup.match(svgPattern);
    if (!svgMatch) {
        throw new Error(`Invalid SVG source for "${style}/${icon}"`);
    }

    const [, svgAttributes, innerMarkup] = svgMatch;
    const viewBoxMatch = svgAttributes.match(viewBoxPattern);
    if (!viewBoxMatch) {
        throw new Error(`Missing viewBox for "${style}/${icon}"`);
    }

    return {
        viewBox: viewBoxMatch[1],
        markup: innerMarkup.replace(commentPattern, '').trim(),
    };
}

async function main() {
    await fs.rm(outputDirectory, { recursive: true, force: true });
    await fs.mkdir(outputDirectory, { recursive: true });
    const iconMetadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

    await Promise.all(
        supportedStyles.map(async (style) => {
            const stylePath = path.join(packageRoot, 'icons', 'svgs', style);
            const spritePath = path.join(packageRoot, 'icons', 'sprites', `${style}.svg`);
            if (!existsSync(stylePath)) {
                if (!existsSync(spritePath)) {
                    throw new Error(
                        `Missing SVG directory and sprite file for "${style}": ${stylePath}, ${spritePath}`
                    );
                }
            }

            const styleOutputDirectory = path.join(outputDirectory, style);
            await fs.mkdir(styleOutputDirectory, { recursive: true });
            const generatedIcons = new Map();

            if (existsSync(stylePath)) {
                const sourceFiles = await fs.readdir(stylePath, { withFileTypes: true });
                await Promise.all(
                    sourceFiles
                        .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
                        .map(async (entry) => {
                            const sourcePath = path.join(stylePath, entry.name);
                            const icon = path.basename(entry.name, '.svg');
                            const svgMarkup = await fs.readFile(sourcePath, 'utf8');
                            const symbolSource = getSymbolSourceFromSVG(svgMarkup, style, icon);

                            generatedIcons.set(icon, symbolSource);
                            await fs.writeFile(
                                path.join(styleOutputDirectory, entry.name),
                                buildSymbolDocumentFromSource(style, icon, symbolSource),
                                'utf8'
                            );
                        })
                );
            } else {
                const sprite = await fs.readFile(spritePath, 'utf8');
                await Promise.all(
                    [...sprite.matchAll(symbolPattern)].map(async (match) => {
                        const [, icon, viewBox, markup] = match;
                        const symbolSource = {
                            viewBox,
                            markup: markup.replace(commentPattern, '').trim(),
                        };

                        generatedIcons.set(icon, symbolSource);
                        await fs.writeFile(
                            path.join(styleOutputDirectory, `${icon}.svg`),
                            buildSymbolDocumentFromSource(style, icon, symbolSource),
                            'utf8'
                        );
                    })
                );
            }

            await Promise.all(
                [...generatedIcons.entries()].flatMap(([icon, symbolSource]) => {
                    const aliases = iconMetadata[icon]?.aliases?.names ?? [];
                    return aliases
                        .filter((alias) => !generatedIcons.has(alias))
                        .map(async (alias) => {
                            generatedIcons.set(alias, symbolSource);
                            await fs.writeFile(
                                path.join(styleOutputDirectory, `${alias}.svg`),
                                buildSymbolDocumentFromSource(style, alias, symbolSource),
                                'utf8'
                            );
                        });
                })
            );
        })
    );

    // biome-ignore lint/suspicious/noConsole: CLI output is useful when regenerating assets.
    console.log(`Generated symbol SVGs for ${supportedStyles.length} styles in ${outputDirectory}`);
}

main().catch((error) => {
    console.error(`Error generating icon symbols: ${error}`);
    process.exit(1);
});
