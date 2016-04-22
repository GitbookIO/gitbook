var Plugins = require('../plugins');

/**
    Load and setup plugins

    @param {Output}
    @return {Promise<Output>}
*/
function preparePlugins(output) {
    var book = output.getBook();

    return Plugins.loadForBook(book)
    .then(function(plugins) {
        return Plugins.validateConfig(book, plugins)
        .then(function(newBook) {
            return output.merge({
                book: newBook,
                plugins: plugins
            });
        });
    });
}

module.exports = preparePlugins;
