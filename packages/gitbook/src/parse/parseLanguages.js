const lookupStructureFile = require('./lookupStructureFile');
const languagesFromDocument = require('./languagesFromDocument');

/**
 * Parse languages list from book
 *
 * @param {Book} book
 * @return {Promise<Book>}
 */
function parseLanguages(book) {
    const { logger } = book;
    const fs = book.getContentFS();

    return lookupStructureFile(book, 'langs')
    .then((file) => {
        logger.debug.ln(`languages index found at ${file.path}`);

        return file.parse(fs)
        .then((document) => {
            let languages = languagesFromDocument(document);
            languages = languages.merge({ file });

            logger.info.ln(`parsing multilingual book, with ${languages.list.size} languages`);

            return book.set('languages', languages);
        });
    });
}

module.exports = parseLanguages;
