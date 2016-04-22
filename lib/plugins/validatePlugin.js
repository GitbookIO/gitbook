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
        packageInfos.name &&
        packageInfos.engines &&
        packageInfos.engines.gitbook
    );

    if (!isValid) {
        return Promise.reject(new Error('Error loading plugin "' + plugin.getName() + '" at "' + plugin.getPath() + '"'));
    }

    if (!gitbook.satisfies(this.packageInfos.engines.gitbook)) {
        return Promise.reject(new Error('GitBook doesn\'t satisfy the requirements of this plugin: ' + packageInfos.engines.gitbook));
    }

    return Promise();
}

module.exports = validatePlugin;
