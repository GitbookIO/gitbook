const Immutable = require('immutable');

const THEME_PREFIX = require('../constants/themePrefix');

const TYPE_PLUGIN = 'plugin';
const TYPE_THEME  = 'theme';


/**
 * Returns the type of a plugin given its name
 * @param {Plugin} plugin
 * @return {String}
 */
function pluginType(plugin) {
    const name = plugin.getName();
    return (name && name.indexOf(THEME_PREFIX) === 0) ? TYPE_THEME : TYPE_PLUGIN;
}


/**
 * Sort the list of dependencies to match list in book.json
 * The themes should always be loaded after the plugins
 *
 * @param {List<PluginDependency>} deps
 * @return {List<PluginDependency>}
 */
function sortDependencies(plugins) {
    const byTypes = plugins.groupBy(pluginType);

    return byTypes.get(TYPE_PLUGIN, Immutable.List())
        .concat(byTypes.get(TYPE_THEME, Immutable.List()));
}

module.exports = sortDependencies;
