const { Map } = require('immutable');

/**
 * List filters from a list of plugins
 *
 * @param {OrderedMap<String:Plugin>} plugins
 * @return {Map<String:Function>} filters
 */
function listFilters(plugins) {
    return plugins
        .reverse()
        .reduce(
            (result, plugin) => {
                return result.merge(plugin.getFilters());
            },
            Map()
        );
}

module.exports = listFilters;
