const DEFAULT_PLUGINS = require('../constants/defaultPlugins');
const Promise = require('../utils/promise');
const installPlugin = require('./installPlugin');

/**
 * Install plugin requirements for a book
 *
 * @param {Book} book
 * @return {Promise<Number>} count
 */
function installPlugins(book) {
    const logger = book.getLogger();
    const config = book.getConfig();
    let plugins = config.getPluginDependencies();

    // Remove default plugins
    // (only if version is same as installed)
    plugins = plugins.filterNot((plugin) => {
        const dependency = DEFAULT_PLUGINS.find((dep) => {
            return dep.getName() === plugin.getName();
        });

        return (
            // Disabled plugin
            !plugin.isEnabled() ||

            // Or default one installed in GitBook itself
            (dependency &&
            plugin.getVersion() === dependency.getVersion())
        );
    });

    if (plugins.size == 0) {
        logger.info.ln('nothing to install!');
        return Promise(0);
    }

    logger.info.ln('installing', plugins.size, 'plugins from registry');

    return Promise.forEach(plugins, (plugin) => {
        return installPlugin(book, plugin);
    })
    .thenResolve(plugins.size);
}

module.exports = installPlugins;
