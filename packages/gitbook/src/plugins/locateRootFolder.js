const path = require('path');
const resolve = require('resolve');

const DEFAULT_PLUGINS = require('../constants/defaultPlugins');

/**
 * Resolve the root folder containing for node_modules
 * since gitbook can be used as a library and dependency can be flattened.
 *
 * @return {String} folderPath
 */
function locateRootFolder() {
    const firstDefaultPlugin = DEFAULT_PLUGINS.first();
    const pluginPath = resolve.sync(firstDefaultPlugin.getNpmID() + '/package.json', {
        basedir: __dirname
    });
    const nodeModules = path.resolve(pluginPath, '../../..');

    return nodeModules;
}

module.exports = locateRootFolder;
