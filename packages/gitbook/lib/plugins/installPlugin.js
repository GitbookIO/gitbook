var npmi = require('npmi');

var Promise = require('../utils/promise');
var resolveVersion = require('./resolveVersion');

/**
    Install a plugin for a book

    @param {Book}
    @param {PluginDependency}
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

module.exports = installPlugin;
