import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import url from 'url';

import { getKitPath } from './kit.js';

/**
 * Scripts to generate the list of all icons.
 */
async function main() {
    const source = getKitPath();
    const icons = JSON.parse(
        await fs.readFile(path.join(source, 'metadata/icon-families.json'), 'utf8'),
    );

    // Only these families have exceptions
    const potentialOnly = ['brands', 'custom-icons'];

    const keyRename = {
        // Font Awesome stores custom icons under "custom-icons"
        // but indicates them as svg.kit.custom in the JSON data
        'kit-custom': 'custom-icons',
    };

    const onlyStyles = {};

    const result = [];
    Object.entries(icons).forEach(([icon, iconSpec]) => {
        const stylesCovered = [];

        Object.entries(iconSpec.svgs).forEach(([family, familyEntries]) => {
            Object.keys(familyEntries).forEach((style) => {
                let key = family !== 'classic' ? `${family}-${style}` : style;
                key = keyRename[key] ?? key;
                stylesCovered.push(key);
            });
        });

        potentialOnly.forEach((style) => {
            if (stylesCovered.includes(style)) {
                onlyStyles[style] = onlyStyles[style] || [];
                onlyStyles[style].push(icon);
            }
        });

        result.push({
            icon,
            label: iconSpec.label,
            search: iconSpec.search?.terms,
        });
    });

    await Promise.all([
        writeDataFile('styles-map', JSON.stringify(onlyStyles, null, 2)),
        writeDataFile('icons', JSON.stringify(result, null, 2)),
    ]);
    console.log(`🎉 ${result.length} icons found`);
}

async function writeDataFile(name, content) {
    const dirname = path.dirname(url.fileURLToPath(import.meta.url));
    await Promise.all([
        fs.writeFile(path.resolve(dirname, `../src/data/${name}.json`), content),
        // Write to dist folder if it exists
        existsSync(path.resolve(dirname, '../dist/'))
            ? fs.writeFile(path.resolve(dirname, `../dist/data/${name}.json`), content)
            : null,
    ]);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
