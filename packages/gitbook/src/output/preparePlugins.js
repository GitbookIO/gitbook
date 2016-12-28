const Plugins = require('../plugins');
const Promise = require('../utils/promise');

/**
 * Load and setup plugins
 *
 * @param {Output}
 * @return {Promise<Output>}
 */
function preparePlugins(output) {
    const book = output.getBook();

    return Promise()

    // Only load plugins for main book
    .then(() => {
        if (book.isLanguageBook()) {
            return output.getPlugins();
        } else {
            return Plugins.loadForBook(book);
        }
    })

    // Update book's configuration using the plugins
    .then((plugins) => {
        return Plugins.validateConfig(book, plugins)
        .then((newBook) => {
            return output.merge({
                book: newBook,
                plugins
            });
        });
    });
}

module.exports = preparePlugins;
