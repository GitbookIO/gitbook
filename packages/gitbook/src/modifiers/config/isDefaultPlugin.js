const DEFAULT_PLUGINS = require('../../constants/defaultPlugins');
const hasPlugin = require('./hasPlugin');

/**
 * Test if a plugin is a default one
 * @param {String} plugin
 * @param {String} version
 * @return {Boolean}
 */
function isDefaultPlugin(pluginName, version) {
    return hasPlugin(DEFAULT_PLUGINS, pluginName, version);
}

module.exports = isDefaultPlugin;
