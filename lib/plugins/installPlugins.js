var npmi = require('npmi');

var pkg = require('../../package.json');
var DEFAULT_PLUGINS = require('../constants/defaultPlugins');
var Promise = require('../utils/promise');
var listForBook = require('./listForBook');
var resolveVersion = require('./resolveVersion');

/**
    Install a plugin for a book

    @param {Book}
    @param {Plugin}
    @return {Promise}
*/
function installPlugin(book, plugin) {
    var logger = book.getLogger();

    var installFolder = book.getRoot();
    var name = plugin.getName();
    var requirement = plugin.getVersion();

    logger.info.ln('');
    logger.info.ln('installing plugin "' + name + '"');

    // Find a version to install
    return resolveVersion(plugin)
    .then(function(version) {
        if (!version) {
            throw new Error('Found no satisfactory version for plugin "' + name + '" with requirement "' + requirement + '"');
        }

        logger.info.ln('install plugin "' + name +'" (' + requirement + ') from NPM with version', version);
        return Promise.nfcall(npmi, {
            'name': plugin.getNpmID(),
            'version': version,
            'path': installFolder,
            'npmLoad': {
                'loglevel': 'silent',
                'loaded': true,
                'prefix': installFolder
            }
        });
    })
    .then(function() {
        logger.info.ok('plugin "' + name + '" installed with success');
    });
}


/**
    Install plugin requirements for a book

    @param {Book}
    @return {Promise}
*/
function installPlugins(book) {
    var logger = book.getLogger();
    var plugins = listForBook(book);

    // Remove default plugins
    // (only if version is same as installed)
    plugins = plugins.filterNot(function(plugin) {
        return (
            DEFAULT_PLUGINS.includes(plugin.getName()) &&
            plugin.getVersion() === pkg.dependencies[plugin.getNpmID()]
        );
    });

    if (plugins.size == 0) {
        logger.info.ln('nothing to install!');
        return Promise();
    }

    logger.info.ln('installing', plugins.size, 'plugins using npm@' + npmi.NPM_VERSION);

    return Promise.forEach(plugins, function(plugin) {
        return installPlugin(book, plugin);
    });
}

module.exports = installPlugins;
