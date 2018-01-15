
/**
 * Test if a plugin is listed
 * @param { {List<PluginDependency}} deps
 * @param {String} plugin
 * @param {String} version
 * @return {Boolean}
 */
function hasPlugin(deps, pluginName, version) {
    return !!deps.find(function(dep) {
        return dep.getName() === pluginName && (!version || dep.getVersion() === version);
    });
}

module.exports = hasPlugin;
