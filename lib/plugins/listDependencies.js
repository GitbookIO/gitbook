var DEFAULT_PLUGINS = require('../constants/defaultPlugins');
var sortDependencies = require('./sortDependencies');

/**
 * List all dependencies for a book, including default plugins.
 * It returns a concat with default plugins and remove disabled ones.
 *
 * @param {List<PluginDependency>} deps
 * @return {List<PluginDependency>}
 */
function listDependencies(deps) {
    // Extract list of plugins to disable (starting with -)
    var toRemove = deps
        .filter(function(plugin) {
            return !plugin.isEnabled();
        })
        .map(function(plugin) {
            return plugin.getName();
        });

    // Concat with default plugins
    deps = deps.concat(DEFAULT_PLUGINS);

    // Remove plugins
    deps = deps.filterNot(function(plugin) {
        return toRemove.includes(plugin.getName());
    });

    // Sort
    return sortDependencies(deps);
}

module.exports = listDependencies;
