var Plugins = require('../plugins');
var Promise = require('../utils/promise');

/**
 * Load and setup plugins
 *
 * @param {Output}
 * @return {Promise<Output>}
 */
function preparePlugins(output) {
    var book = output.getBook();

    return Promise()

    // Only load plugins for main book
    .then(function() {
        if (book.isLanguageBook()) {
            return output.getPlugins();
        } else {
            return Plugins.loadForBook(book);
        }
    })

    // Update book's configuration using the plugins
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
