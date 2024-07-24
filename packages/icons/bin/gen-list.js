const fs = require('fs/promises');
const path = require('path');
const { getKitPath } = require('./kit');

/**
 * Scripts to generate the list of all icons
 */
async function main() {
    const outputFile = path.resolve(__dirname, '../icons.json');
    const source = getKitPath();
    const icons = JSON.parse(await fs.readFile(path.join(source, 'icons/metadata/icon-families.json'), 'utf8'));

    const result = [];
    Object.entries(icons).forEach(([icon, iconSpec]) => {
        result.push({
            icon,
            label: iconSpec.label,
            search: iconSpec.search?.terms,
        })
    });
   
    await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
    console.log(`🎉 ${result.length} icons found`);
}

main().catch(console.error);

