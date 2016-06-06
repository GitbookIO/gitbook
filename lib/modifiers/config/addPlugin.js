var PluginDependency = require('../../models/pluginDependency');

/**
 * Add a plugin to a book's configuration
 * @param {Config} config
 * @param {String} plugin
 * @param {String} version (optional)
 * @return {Config}
 */
function addPlugin(config, plugin, version) {
    var deps = config.getPluginDependencies();

    var dep = PluginDependency.create(plugin, version);

    deps = deps.push(dep);
    return config.setPluginDependencies(deps);
}

module.exports = addPlugin;
