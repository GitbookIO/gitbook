
/**
 * Remove a plugin from a book's configuration
 * @param {Config} config
 * @param {String} plugin
 * @return {Config}
 */
function removePlugin(config, pluginName) {
    var deps = config.getPluginDependencies();

    deps = deps.filter(function(dep) {
        return dep.getName() === pluginName;
    });
    return config.setPluginDependencies(deps);
}

module.exports = removePlugin;
