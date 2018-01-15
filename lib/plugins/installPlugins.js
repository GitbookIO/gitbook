var npmi = require('npmi');

var DEFAULT_PLUGINS = require('../constants/defaultPlugins');
var Promise = require('../utils/promise');
var installPlugin = require('./installPlugin');

/**
    Install plugin requirements for a book

    @param {Book}
    @return {Promise<Number>}
*/
function installPlugins(book) {
    var logger = book.getLogger();
    var config = book.getConfig();
    var plugins = config.getPluginDependencies();

    // Remove default plugins
    // (only if version is same as installed)
    plugins = plugins.filterNot(function(plugin) {
        var dependency = DEFAULT_PLUGINS.find(function(dep) {
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
        return Promise();
    }

    logger.info.ln('installing', plugins.size, 'plugins using npm@' + npmi.NPM_VERSION);

    return Promise.forEach(plugins, function(plugin) {
        return installPlugin(book, plugin);
    })
    .thenResolve(plugins.size);
}

module.exports = installPlugins;
