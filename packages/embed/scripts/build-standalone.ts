import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { Features, transform } from 'lightningcss';

/**
 * Build the standalone embed script.
 * Bun's default CSS transpiler (which is a port of LightningCSS) strips out the native light-dark() function in favour of a polyfill.
 * Light-dark() is widely supported now, and the polyfill requires you to set a data attribute on the element instead of relying on plain CSS.
 * This script's purpose is to pass a feature flag to the CSS transpiler to keep the native light-dark() behavior.
 */
await new Promise<void>((resolve, reject) => {
    const child = spawn(
        'bun',
        ['build', 'src/standalone/index.ts', '--bundle', '--minify', '--outdir=standalone'],
        { stdio: 'inherit' }
    );
    child.on('error', reject);
    child.on('exit', (code) => {
        if (code === 0) {
            resolve();
            return;
        }
        reject(new Error(`bun build failed with exit code ${code ?? 'unknown'}`));
    });
});

const sourceCSS = await readFile('src/standalone/style.css');
const transformedCSS = transform({
    filename: 'src/standalone/style.css',
    code: sourceCSS,
    minify: true,
    // Keep native light-dark() behavior scoped to element color-scheme.
    exclude: Features.LightDark,
});

await writeFile('standalone/index.css', transformedCSS.code);
