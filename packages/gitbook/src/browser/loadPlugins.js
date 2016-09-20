const path = require('path');

/**
 * Load all browser plugins
 * @param  {List<Plugin>} plugins
 * @return {List}
 */
function loadPlugins(plugins) {
    return plugins
        .filter(plugin => plugin.getPackage().has('browser'))
        .map(plugin => {
            const browserFile = path.resolve(
                plugin.getPath(),
                plugin.getPackage().get('browser')
            );

            return require(browserFile);
        });
}

module.exports = loadPlugins;
