import path from 'node:path';
import url from 'node:url';

/**
 * Get the path to the kit, depending on the Pro or Free version.
 */
export function getKitPath() {
    return path.resolve(
        path.dirname(
            url.fileURLToPath(import.meta.resolve('@gitbook/fontawesome-pro/package.json'))
        ),
        'icons'
    );
}
