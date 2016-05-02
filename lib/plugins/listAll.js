var is = require('is');
var Immutable = require('immutable');
var Plugin = require('../models/plugin');

var pkg = require('../../package.json');
var DEFAULT_PLUGINS = require('../constants/defaultPlugins');

/**
    List all plugins for a book

    @param {List<Plugin|String>}
    @return {OrderedMap<Plugin>}
*/
function listAll(plugins) {
    if (is.string(plugins)) {
        plugins = Immutable.List(plugins.split(','));
    }

    // Convert to an ordered map
    plugins = plugins.map(function(plugin) {
        if (is.string(plugin)) {
            plugin = Plugin.createFromString(plugin);
        } else {
            plugin = new Plugin(plugin);
        }

        return [plugin.getName(), plugin];
    });
    plugins = Immutable.OrderedMap(plugins);

    // Extract list of plugins to disable (starting with -)
    var toRemove = plugins.toList()
        .filter(function(plugin) {
            return plugin.getName()[0] === '-';
        })
        .map(function(plugin) {
            return plugin.getName().slice(1);
        });

    // Remove the '-'
    plugins = plugins.mapKeys(function(name) {
        if (name[0] === '-') {
            return name.slice(1);
        } else {
            return name;
        }
    });

    // Append default plugins
    DEFAULT_PLUGINS.forEach(function(pluginName) {
        if (plugins.has(pluginName)) return;

        plugins = plugins.set(pluginName, new Plugin({
            name: pluginName,
            version: pkg.dependencies[Plugin.nameToNpmID(pluginName)]
        }));
    });

    // Remove plugins
    plugins = plugins.filterNot(function(plugin, name) {
        return toRemove.includes(name);
    });

    return plugins;
}

module.exports = listAll;
