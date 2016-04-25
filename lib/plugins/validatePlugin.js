var gitbook = require('../gitbook');

var Promise = require('../utils/promise');

/**
    Validate a plugin

    @param {Plugin}
    @return {Promise<Plugin>}
*/
function validatePlugin(plugin) {
    var packageInfos = plugin.getPackage();

    var isValid = (
        plugin.isLoaded() &&
        packageInfos &&
        packageInfos.get('name') &&
        packageInfos.get('engines') &&
        packageInfos.get('engines').get('gitbook')
    );

    if (!isValid) {
        return Promise.reject(new Error('Error loading plugin "' + plugin.getName() + '" at "' + plugin.getPath() + '"'));
    }

    var engine = packageInfos.get('engines').get('gitbook');
    if (!gitbook.satisfies(engine)) {
        return Promise.reject(new Error('GitBook doesn\'t satisfy the requirements of this plugin: ' + engine));
    }

    return Promise(plugin);
}

module.exports = validatePlugin;
