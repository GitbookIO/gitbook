#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');

/**
 * Scripts to copy the assets to a public folder.
 */
async function main() {
    const outputFolder = path.resolve(process.cwd(), process.argv[2] ?? 'public/math');
    const packageJson = require('mathjax/package.json');
    const source = path.dirname(require.resolve('mathjax/package.json'));

    // Create the output folder if it doesn't exist
    await fs.mkdir(outputFolder, { recursive: true });

    // Copy the assets
    await Promise.all([
        fs.cp(path.join(source, 'es5'), path.join(outputFolder, 'mathjax@' + packageJson.version), {
            recursive: true,
        }),
    ]);

    console.log(`🎉 MathJaX assets copied to ${outputFolder}`);
}

main().catch(console.error);
