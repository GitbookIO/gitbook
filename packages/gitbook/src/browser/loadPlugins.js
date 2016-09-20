const path = require('path');

/**
 * Load all browser plugins
 * @param  {OrderedMap<Plugin>} plugins
 * @return {Array}
 */
function loadPlugins(plugins) {
    return plugins
        .valueSeq()
        .filter(plugin => plugin.getPackage().has('browser'))
        .map(plugin => {
            const browserFile = path.resolve(
                plugin.getPath(),
                plugin.getPackage().get('browser')
            );

            return require(browserFile);
        })
        .toArray();
}

module.exports = loadPlugins;
