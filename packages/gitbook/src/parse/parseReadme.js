const lookupStructureFile = require('./lookupStructureFile');
const readmeFromDocument = require('./readme/fromDocument');
const error = require('../utils/error');

/**
 * Parse readme from book.
 *
 * @param {Book} book
 * @return {Promise<Book>}
 */
function parseReadme(book) {
    const { logger } = book;
    const fs = book.getContentFS();

    return lookupStructureFile(book, 'readme')
    .then((file) => {
        if (!file) {
            throw new error.FileNotFoundError({ filename: 'README' });
        }

        logger.debug.ln('readme found at', file.path);
        return file.parse(fs)
        .then((document) => {
            let readme = readmeFromDocument(document);
            readme = readme.merge({ file });
            return book.set('readme', readme);
        });
    });
}

module.exports = parseReadme;
