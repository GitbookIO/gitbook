var gitbook = require('../gitbook');

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
        readme: encodeReadme(book.getReadme()),
        config: book.getConfig().getValues().toJS(),
        gitbook: {
            version: gitbook.version,
            time: gitbook.START_TIME
        }
    };
}

module.exports = encodeBookToJson;
