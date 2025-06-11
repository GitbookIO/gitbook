import fs from 'node:fs/promises';
import path from 'node:path';

import { APIv2 } from 'google-font-metadata';

import { CustomizationDefaultFont } from '@gitbook/api';

import type { FontDefinitions } from '../src/types';

const googleFontsMap: { [fontName in CustomizationDefaultFont]: string } = {
    [CustomizationDefaultFont.Inter]: 'inter',
    [CustomizationDefaultFont.FiraSans]: 'fira-sans-extra-condensed',
    [CustomizationDefaultFont.IBMPlexSerif]: 'ibm-plex-serif',
    [CustomizationDefaultFont.Lato]: 'lato',
    [CustomizationDefaultFont.Merriweather]: 'merriweather',
    [CustomizationDefaultFont.NotoSans]: 'noto-sans',
    [CustomizationDefaultFont.OpenSans]: 'open-sans',
    [CustomizationDefaultFont.Overpass]: 'overpass',
    [CustomizationDefaultFont.Poppins]: 'poppins',
    [CustomizationDefaultFont.Raleway]: 'raleway',
    [CustomizationDefaultFont.Roboto]: 'roboto',
    [CustomizationDefaultFont.RobotoSlab]: 'roboto-slab',
    [CustomizationDefaultFont.SourceSansPro]: 'source-sans-3',
    [CustomizationDefaultFont.Ubuntu]: 'ubuntu',
    [CustomizationDefaultFont.ABCFavorit]: 'inter',
};

/**
 * Scripts to generate the list of all icons.
 */
async function main() {
    // @ts-expect-error - we build the object
    const output: FontDefinitions = {};

    for (const font of Object.values(CustomizationDefaultFont)) {
        const googleFontName = googleFontsMap[font];
        const fontMetadata = APIv2[googleFontName.toLowerCase()];
        if (!fontMetadata) {
            throw new Error(`Font ${googleFontName} not found`);
        }

        output[font] = {
            font: googleFontName,
            unicodeRange: fontMetadata.unicodeRange,
            variants: {
                '400': {},
                '700': {},
            },
        };

        Object.keys(output[font].variants).forEach((weight) => {
            const variants = fontMetadata.variants[weight];
            const normalVariant = variants.normal;
            if (!normalVariant) {
                throw new Error(`Font ${googleFontName} has no normal variant`);
            }

            output[font].variants[weight] = {};
            Object.entries(normalVariant).forEach(([script, url]) => {
                output[font].variants[weight][script] = url.url.woff;
            });
        });
    }

    await writeDataFile('fonts', JSON.stringify(output, null, 2));
}

/**
 * We write both in dist and src as the build process might have happen already
 * and tsc doesn't copy the files.
 */
async function writeDataFile(name, content) {
    const srcData = path.resolve(__dirname, '../src/data');
    const distData = path.resolve(__dirname, '../dist/data');

    // Ensure the directories exists
    await Promise.all([
        fs.mkdir(srcData, { recursive: true }),
        fs.mkdir(distData, { recursive: true }),
    ]);

    await Promise.all([
        fs.writeFile(path.resolve(srcData, `${name}.json`), content),
        fs.writeFile(path.resolve(distData, `${name}.json`), content),
    ]);
}

main().catch((error) => {
    console.error(`Error generating icons list: ${error}`);
    process.exit(1);
});
