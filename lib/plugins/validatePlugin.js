var gitbook = require('../gitbook');

var Promise = require('../utils/promise');

/**
    Validate a plugin

    @param {Plugin}
    @return {Promise<Plugin>}
*/
function validatePlugin(plugin) {
    var packageInfos = plugin.getPackage();

    if (!packageInfos) {
        return Promise.reject(
            new Error('Error getting plugin package information at "' + plugin.getPath() + '"')
        );
    }

    var isLoaded = plugin.isLoaded();
    var name = packageInfos.get('name');
    var engines = packageInfos.get('engines');

    var isValid = isLoaded && name && engines && engines.get('gitbook');

    if (!isValid) {
        var error = 'Error validating plugin' + (name ? '"' + name + '"' : '');

        if (!isLoaded){
            error += '\n  plugin could not be loaded';
        }
        if (!name) {
            error += '\n  "name" must be defined in plugin\'s package.json';
        }
        if (!engines) {
            error += '\n  "engines" must be defined in plugin\'s package.json';
        }
        if (engines && !engines.get('gitbook')) {
            error += '\n  "gitbook" must be defined in plugin\'s package.json "engines" field';
        }
        error += '\n    at "' + plugin.getPath() + '"';

        return Promise.reject(new Error(error));
    }

    var engine = engines.get('gitbook');
    if (!gitbook.satisfies(engine)) {
        return Promise.reject(
            new Error('GitBook doesn\'t satisfy the requirements of this plugin: ' + engine)
        );
    }

    return Promise(plugin);
}

module.exports = validatePlugin;
