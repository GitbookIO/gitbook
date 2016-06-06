var DEFAULT_PLUGINS = require('../../constants/defaultPlugins');
var togglePlugin = require('./togglePlugin');

/**
 * Remove a plugin from a book's configuration
 * @param {Config} config
 * @param {String} plugin
 * @return {Config}
 */
function removePlugin(config, pluginName) {
    var deps = config.getPluginDependencies();

    var isDefault = DEFAULT_PLUGINS.find(function(dep) {
        return dep.getName() === pluginName;
    });

    // For default plugin, we have to disable it instead of removing from the list
    if (isDefault) {
        return togglePlugin(config, pluginName, false);
    }

    // Remove the dependency from the list
    deps = deps.filter(function(dep) {
        return dep.getName() === pluginName;
    });
    return config.setPluginDependencies(deps);
}

module.exports = removePlugin;
