
/**
 * Enable/disable a plugin dependency
 * @param {Config} config
 * @param {String} plugin
 * @param {Boolean} state (optional)
 * @return {Config}
 */
function togglePlugin(config, plugin, state) {
    var deps = config.getPluginDependencies();

    deps = deps.map(function(dep) {
        if (dep.getName() === plugin) {
            return dep.toggle(state);
        }

        return dep;
    });

    return config.setPluginDependencies(deps);
}

module.exports = togglePlugin;
