var THEME_PREFIX = require('../constants/themePrefix');
var LOADING_ORDER = ['plugin', 'theme'];

/**
 * Returns the type of a plugin given its name
 * @return {String}
 */
function pluginType(name) {
    return (name && name.indexOf(THEME_PREFIX) === 0) ? 'theme' : 'plugin';
}


/**
 * Sort the list of installed plugins to match list in book.json
 * The themes should always be loaded after the plugins
 *
 * @param {<OrderedMap<String:Plugin>>} plugins
 * @param {<List<String>>} requirementsKeys
 * @return {OrderedMap<String:Plugin>}
 */
function sortPlugins(plugins, requirementsKeys) {
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