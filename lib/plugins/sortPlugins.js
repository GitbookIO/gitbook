var Immutable = require('immutable');

var THEME_PREFIX = require('../constants/themePrefix');

var TYPE_PLUGIN = 'plugin';
var TYPE_THEME  = 'theme';


/**
 * Returns the type of a plugin given its name
 * @param {Plugin} plugin
 * @return {String}
 */
function pluginType(plugin) {
    var name = plugin.getName();
    return (name && name.indexOf(THEME_PREFIX) === 0) ? TYPE_THEME : TYPE_PLUGIN;
}


/**
 * Sort the list of installed plugins to match list in book.json
 * The themes should always be loaded after the plugins
 *
 * @param {<OrderedMap<String:Plugin>>} plugins
 * @return {OrderedMap<String:Plugin>}
 */
function sortPlugins(plugins) {
    var byTypes = plugins.groupBy(pluginType);

    return byTypes.get(TYPE_PLUGIN, Immutable.OrderedMap())
        .merge(
            byTypes.get(TYPE_THEME, Immutable.OrderedMap())
        );
}

module.exports = sortPlugins;