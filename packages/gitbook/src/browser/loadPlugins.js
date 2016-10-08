const path = require('path');

/**
 * Load all browser plugins.
 *
 * @param  {OrderedMap<Plugin>} plugins
 * @param  {String} type ('browser', 'ebook')
 * @return {Array}
 */
function loadPlugins(plugins, type) {
    return plugins
        .valueSeq()
        .filter(plugin => plugin.getPackage().has(type))
        .map(plugin => {
            const browserFile = path.resolve(
                plugin.getPath(),
                plugin.getPackage().get(type)
            );

            return require(browserFile);
        })
        .toArray();
}

module.exports = loadPlugins;
