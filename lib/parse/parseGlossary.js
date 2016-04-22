var parseStructureFile = require('./parseStructureFile');
var Glossary = require('../models/glossary');

/**
    Parse glossary

    @param {Book} book
    @return {Promise<Book>}
*/
function parseGlossary(book) {
    return parseStructureFile(book, 'glossary')
    .spread(function(file, entries) {
        if (!file) {
            return book;
        }

        var glossary = Glossary.createFromEntries(file, entries);
        return book.set('glossary', glossary);
    });
}

module.exports = parseGlossary;
