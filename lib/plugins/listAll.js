var Immutable = require('immutable');
var Plugin = require('../models/plugin');

var DEFAULT_PLUGINS = require('../constants/defaultPlugins');
var sortPlugins = require('./sortPlugins');

/**
    List all plugins for a book

    @param {List<PluginDependency>} deps
    @return {OrderedMap<Plugin>}
*/
function listAll(deps) {
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

    // Convert to an ordered map of Plugin
    var plugins = deps
        .map(function(dep) {
            var plugin = Plugin.createFromDep(dep);

            return [dep.getName(), plugin];
        });
    plugins = Immutable.OrderedMap(plugins);

    // Remove plugins
    plugins = plugins.filterNot(function(plugin, name) {
        return toRemove.includes(name);
    });

    // Sort plugins
    return sortPlugins(plugins);
}

module.exports = listAll;
