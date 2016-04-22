var parseStructureFile = require('./parseStructureFile');
var Summary = require('../models/summary');

/**
    Parse summary in a book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseSummary(book) {
    return parseStructureFile(book, 'summary')
    .spread(function(file, result) {
        if (!file) {
            return book;
        }

        var summary = Summary.createFromParts(file, result.parts);
        return book.set('summary', summary);
    });
}

module.exports = parseSummary;
