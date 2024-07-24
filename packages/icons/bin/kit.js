const path = require('path');

/**
 * Get the path to the kit, depending on the Pro or Free version.
 */
module.exports.getKitPath = function getKitPath() {
    let source = path.dirname(require.resolve('@fortawesome/fontawesome-free/package.json'));
    try {
        source = path.dirname(require.resolve('@awesome.me/kit-a463935e93/package.json'));
    } catch(error) {
        console.warn('⚠️ Could not find the Pro kit, using the free kit instead');
    }

    return source;
}