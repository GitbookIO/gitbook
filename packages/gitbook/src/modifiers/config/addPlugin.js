const PluginDependency = require('../../models/pluginDependency');
const togglePlugin = require('./togglePlugin');
const isDefaultPlugin = require('./isDefaultPlugin');

/**
 * Add a plugin to a book's configuration
 * @param {Config} config
 * @param {String} pluginName
 * @param {String} version (optional)
 * @return {Config}
 */
function addPlugin(config, pluginName, version) {
    // For default plugin, we only ensure it is enabled
    if (isDefaultPlugin(pluginName, version)) {
        return togglePlugin(config, pluginName, true);
    }

    let deps = config.getPluginDependencies();
    const dep = PluginDependency.create(pluginName, version);

    deps = deps.push(dep);
    return config.setPluginDependencies(deps);
}

module.exports = addPlugin;
