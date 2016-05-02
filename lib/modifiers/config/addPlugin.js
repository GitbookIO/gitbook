
/**
    Add a plugin to a book's configuration

    @param {Book} book
    @param {String} plugin
    @param {String} version (optional)
    @return {Book}
*/
function addPlugin(book, plugin, version) {
    var config = book.getConfig();
    var plugins = config.getValue('plugins', []);

    plugins = plugins.push('livereload');
    config = config.setValue('plugins', plugins);

    return book.setConfig(config);
}

module.exports = addPlugin;
