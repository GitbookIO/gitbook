const DEFAULT_PLUGINS = require('../constants/defaultPlugins');
const sortDependencies = require('./sortDependencies');

/**
 * List all dependencies for a book, including default plugins.
 * It returns a concat with default plugins and remove disabled ones.
 *
 * @param {List<PluginDependency>} deps
 * @return {List<PluginDependency>}
 */
function listDependencies(deps) {
    // Extract list of plugins to disable (starting with -)
    const toRemove = deps
        .filter((plugin) => {
            return !plugin.isEnabled();
        })
        .map((plugin) => {
            return plugin.getName();
        });

    // Concat with default plugins
    deps = deps.concat(DEFAULT_PLUGINS);

    // Remove plugins
    deps = deps.filterNot((plugin) => {
        return toRemove.includes(plugin.getName());
    });

    // Sort
    return sortDependencies(deps);
}

module.exports = listDependencies;
