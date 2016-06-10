var Immutable = require('immutable');

var THEME_PREFIX = require('../constants/themePrefix');
var LOADING_ORDER = ['plugin', 'theme'];

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



    // Sort plugins to match list in book.json
    return plugins.sort(function(a, b) {
        // Get order from book.json
        var definitionOrder = requirementsKeys.indexOf(a.getName()) < requirementsKeys.indexOf(b.getName());

        // Get order from plugins a and b type
        var aType = pluginType(a.getName()),
            bType = pluginType(b.getName()),
            loadingOrder = LOADING_ORDER.indexOf(aType) < LOADING_ORDER.indexOf(bType);

        return loadingOrder || definitionOrder ? -1 : 1;
    });
}

module.exports = sortPlugins;