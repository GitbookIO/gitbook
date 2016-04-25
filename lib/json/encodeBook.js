var encodeSummary = require('./encodeSummary');
var encodeGlossary = require('./encodeGlossary');
var encodeReadme = require('./encodeReadme');

/**
    Encode a book to JSON

    @param {Book}
    @return {Object}
*/
function encodeBookToJson(book) {
    return {
        summary: encodeSummary(book.getSummary()),
        glossary: encodeGlossary(book.getGlossary()),
        readme: encodeReadme(book.getReadme())
    };
}

module.exports = encodeBookToJson;
