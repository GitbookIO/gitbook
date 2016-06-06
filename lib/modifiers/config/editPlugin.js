
/**
 * Edit ocnfiguration of a plugin
 * @param {Book} book
 * @param {String} plugin
 * @param {Object} pluginConfig
 * @return {Book}
 */
function editPlugin(book, pluginName, pluginConfig) {
    var config = book.getConfig();
    config = config.set('pluginsConfig.'+pluginName, pluginConfig);

    return book.setConfig(config);
}

module.exports = editPlugin;
