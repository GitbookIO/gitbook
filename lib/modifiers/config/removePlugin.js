
/**
    Remove a plugin from a book's configuration

    @param {Book} book
    @param {String} plugin
    @return {Book}
*/
function removePlugin(book, pluginName) {
    var config = book.getConfig();
    var plugins = config.getValue('plugins', []);

    // Find index of this plugin
    var index = plugins.findIndex(function(plugin) {
        return plugin === pluginName;
    });

    plugins = plugins.delete(index);
    config = config.setValue('plugins', plugins);

    return book.setConfig(config);
}

module.exports = removePlugin;
