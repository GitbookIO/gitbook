var parseStructureFile = require('./parseStructureFile');
var Readme = require('../models/readme');

var error = require('../utils/error');

/**
    Parse readme from book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseReadme(book) {
    return parseStructureFile(book, 'readme')
    .spread(function(file, result) {
        if (!file) {
            throw new error.FileNotFoundError({ filename: 'README' });
        }

        var readme = Readme.create(file, result);
        return book.set('readme', readme);
    });
}

module.exports = parseReadme;
