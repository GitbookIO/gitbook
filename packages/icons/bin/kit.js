import path from 'path';
import url from 'url';

/**
 * Get the path to the kit, depending on the Pro or Free version.
 */
export function getKitPath() {
    let source = path.dirname(
        url.fileURLToPath(import.meta.resolve('@fortawesome/fontawesome-free/package.json')),
    );
    try {
        source = path.dirname(
            url.fileURLToPath(import.meta.resolve('@awesome.me/kit-a463935e93/package.json')),
        );
    } catch (error) {
        console.warn('⚠️ Could not find the Pro kit, using the free kit instead');
    }

    return source;
}
