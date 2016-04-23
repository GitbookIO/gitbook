var parseStructureFile = require('./parseStructureFile');
var Languages = require('../models/languages');

/**
    Parse languages list from book

    @param {Book} book
    @return {Promise<Book>}
*/
function parseLanguages(book) {
    return parseStructureFile(book, 'langs')
    .spread(function(file, result) {
        if (!file) {
            return;
        }

        var languages = Languages.createFromList(file, result);
        return book.set('languages', languages);
    });
}

module.exports = parseLanguages;
