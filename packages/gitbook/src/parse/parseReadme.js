const lookupStructureFile = require('./lookupStructureFile');
const Readme = require('../models/readme');
const error = require('../utils/error');

/**
 * Parse readme from book.
 *
 * @param {Book} book
 * @return {Promise<Book>}
 */
function parseReadme(book) {
    const { logger } = book;

    return lookupStructureFile(book, 'readme')
    .then((file) => {
        if (!file) {
            throw new error.FileNotFoundError({ filename: 'README' });
        }

        logger.debug.ln(`readme found at ${file.path}`);

        return book.set('readme', Readme.create({ file }));
    });
}

module.exports = parseReadme;
