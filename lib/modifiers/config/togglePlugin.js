
/**
 * Enable/disable a plugin dependency
 * @param {Book} book
 * @param {String} plugin
 * @param {Boolean} state (optional)
 * @return {Book}
 */
function togglePlugin(book, plugin, state) {
    var config = book.getConfig();
    var deps = config.getPluginDependencies();

    deps = deps.map(function(dep) {
        if (dep.getName() === plugin) {
            return dep.toggle(state);
        }

        return dep;
    });

    config = config.setPluginDependencies(deps);
    return book.setConfig(config);
}

module.exports = togglePlugin;
