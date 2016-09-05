const parseStructureFile = require('./parseStructureFile');
const Readme = require('../models/readme');

const error = require('../utils/error');

/**
    Parse readme from book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseReadme(book) {
    const logger = book.getLogger();

    return parseStructureFile(book, 'readme')
    .spread(function(file, result) {
        if (!file) {
            throw new error.FileNotFoundError({ filename: 'README' });
        }

        logger.debug.ln('readme found at', file.getPath());

        const readme = Readme.create(file, result);
        return book.set('readme', readme);
    });
}

module.exports = parseReadme;
