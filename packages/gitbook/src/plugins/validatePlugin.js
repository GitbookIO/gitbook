const gitbook = require('../gitbook');

const Promise = require('../utils/promise');

/**
    Validate a plugin

    @param {Plugin}
    @return {Promise<Plugin>}
*/
function validatePlugin(plugin) {
    const packageInfos = plugin.getPackage();

    const isValid = (
        plugin.isLoaded() &&
        packageInfos &&
        packageInfos.get('name') &&
        packageInfos.get('engines') &&
        packageInfos.get('engines').get('gitbook')
    );

    if (!isValid) {
        return Promise.reject(new Error('Error loading plugin "' + plugin.getName() + '" at "' + plugin.getPath() + '"'));
    }

    const engine = packageInfos.get('engines').get('gitbook');
    if (!gitbook.satisfies(engine)) {
        return Promise.reject(new Error('GitBook doesn\'t satisfy the requirements of this plugin: ' + engine));
    }

    return Promise(plugin);
}

module.exports = validatePlugin;
