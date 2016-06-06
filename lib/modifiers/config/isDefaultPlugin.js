var DEFAULT_PLUGINS = require('../../constants/defaultPlugins');

/**
 * Test if a plugin is a default one
 * @param {String} plugin
 * @param {String} version
 * @return {Boolean}
 */
function isDefaultPlugin(pluginName, version) {
    return !!DEFAULT_PLUGINS.find(function(dep) {
        return dep.getName() === pluginName && (!version || dep.getVersion() === version);
    });
}

module.exports = isDefaultPlugin;
