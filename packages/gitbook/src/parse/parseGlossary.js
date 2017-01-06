const lookupStructureFile = require('./lookupStructureFile');
const glossaryFromDocument = require('./glossaryFromDocument');

/**
 * Parse glossary.
 *
 * @param {Book} book
 * @return {Promise<Book>}
 */
function parseGlossary(book) {
    const { logger } = book;
    const fs = book.getContentFS();

    return lookupStructureFile(book, 'glossary')
    .then((file) => {
        if (!file) {
            logger.debug.ln('no glossary located');
            return book;
        }

        logger.debug.ln(`glossary found at ${file.path}`);
        return file.parse(fs)
        .then((document) => {
            let glossary = glossaryFromDocument(document);
            glossary = glossary.setFile(file);
            return book.set('glossary', glossary);
        });
    });
}

module.exports = parseGlossary;
