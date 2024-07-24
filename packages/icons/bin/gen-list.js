const fs = require('fs/promises');
const path = require('path');
const { getKitPath } = require('./kit');

/**
 * Scripts to generate the list of all icons.
 */
async function main() {
    const source = getKitPath();
    const icons = JSON.parse(await fs.readFile(path.join(source, 'icons/metadata/icon-families.json'), 'utf8'));
    const potentialOnly = ['brands'];

    const onlyStyles = {};

    const result = [];
    Object.entries(icons).forEach(([icon, iconSpec]) => {
        const stylesCovered = [];

        Object.entries(iconSpec.svgs).forEach(([family, familyEntries]) => {
            Object.keys(familyEntries).forEach(style => {
                const key = family !== 'classic' ? `${family}-${style}` : style;
                stylesCovered.push(key);
            });
        });

        potentialOnly.forEach(style => {
            if (stylesCovered.includes(style)) {
                onlyStyles[style] = onlyStyles[style] || [];
                onlyStyles[style].push(icon);
            }
        })

        result.push({
            icon,
            label: iconSpec.label,
            search: iconSpec.search?.terms,
        })
    });
   
    await fs.writeFile(path.resolve(__dirname, '../data/styles-map.json'), JSON.stringify(onlyStyles, null, 2));
    await fs.writeFile(path.resolve(__dirname, '../data/icons.json'), JSON.stringify(result, null, 2));
    console.log(`🎉 ${result.length} icons found`);
}

main().catch(console.error);

