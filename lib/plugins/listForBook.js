var listAll = require('./listAll');

/**
    List all plugin requirements for a book.
    It can be different from the final list of plugins,
    since plugins can have their own dependencies

    @param {Book}
    @return {OrderedMap<Plugin>}
*/
function listForBook(book) {
    var config = book.getConfig();
    var plugins = config.getPluginDependencies();

    return listAll(plugins);
}

module.exports = listForBook;
