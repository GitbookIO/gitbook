var parseStructureFile = require('./parseStructureFile');
var Summary = require('../models/summary');

/**
    Parse summary in a book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseSummary(book) {
    var logger = book.getLogger();

    return parseStructureFile(book, 'summary')
    .spread(function(file, result) {
        if (!file) {
            logger.warn.ln('no summary file in this book');
            return book;
        }
        logger.debug.ln('summary file found at', file.getPath());

        var summary = Summary.createFromParts(file, result.parts);
        return book.set('summary', summary);
    });
}

module.exports = parseSummary;
