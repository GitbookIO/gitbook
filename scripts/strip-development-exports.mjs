import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function stripDevelopmentExports(exportsField) {
    if (!exportsField || typeof exportsField !== 'object' || Array.isArray(exportsField)) {
        return false;
    }

    let changed = false;

    if (Object.prototype.hasOwnProperty.call(exportsField, 'development')) {
        delete exportsField.development;
        changed = true;
    }

    for (const value of Object.values(exportsField)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            if (stripDevelopmentExports(value)) {
                changed = true;
            }
        }
    }

    return changed;
}

export async function stripDevelopmentExportsInFile(filePath) {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!parsed.exports) {
        return false;
    }

    const changed = stripDevelopmentExports(parsed.exports);

    if (!changed) {
        return false;
    }

    const next = `${JSON.stringify(parsed, null, 4)}\n`;
    await fs.writeFile(filePath, next);
    return true;
}

async function main() {
    const filePath = process.argv[2] || path.join(process.cwd(), 'package.json');
    await stripDevelopmentExportsInFile(filePath);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        console.error('Failed to strip development exports:', error);
        process.exit(1);
    });
}
