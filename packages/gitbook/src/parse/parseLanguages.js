const Languages = require('../models/languages');

/**
 * Parse languages list from book
 *
 * @param {Book} book
 * @return {Promise<Book>}
 */
function parseLanguages(book) {
    const logger = book.getLogger();

    return parseStructureFile(book, 'langs')
    .spread((file, result) => {
        if (!file) {
            return book;
        }

        const languages = Languages.createFromList(file, result);

        logger.debug.ln('languages index file found at', file.getPath());
        logger.info.ln('parsing multilingual book, with', languages.getList().size, 'languages');

        return book.set('languages', languages);
    });
}

module.exports = parseLanguages;
