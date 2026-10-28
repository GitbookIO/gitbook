import { expect, test } from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { stripDevelopmentExportsInFile } from './strip-development-exports.mjs';

test('stripDevelopmentExportsInFile removes development conditions', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'strip-dev-exports-'));
    const filePath = path.join(dir, 'package.json');

    const original = {
        name: '@gitbook/example',
        exports: {
            '.': {
                types: './dist/index.d.ts',
                development: './src/index.ts',
                default: './dist/index.js',
            },
            './icons': {
                types: './dist/icons.d.ts',
                development: './src/icons.ts',
                default: './dist/icons.js',
            },
        },
    };

    await fs.writeFile(filePath, `${JSON.stringify(original, null, 4)}\n`);

    const changed = await stripDevelopmentExportsInFile(filePath);
    expect(changed).toBe(true);

    const updated = JSON.parse(await fs.readFile(filePath, 'utf8'));

    expect(updated.exports['.'].development).toBeUndefined();
    expect(updated.exports['./icons'].development).toBeUndefined();
    expect(updated.exports['.'].default).toBe('./dist/index.js');
});

test('stripDevelopmentExportsInFile returns false when nothing to remove', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'strip-dev-exports-'));
    const filePath = path.join(dir, 'package.json');

    const original = {
        name: '@gitbook/example',
        exports: {
            '.': {
                types: './dist/index.d.ts',
                default: './dist/index.js',
            },
        },
    };

    await fs.writeFile(filePath, `${JSON.stringify(original, null, 4)}\n`);

    const changed = await stripDevelopmentExportsInFile(filePath);
    expect(changed).toBe(false);

    const updated = JSON.parse(await fs.readFile(filePath, 'utf8'));
    expect(updated).toEqual(original);
});
