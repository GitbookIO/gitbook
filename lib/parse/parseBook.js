var Promise = require('../utils/promise');

var parseIgnore = require('./parseIgnore');
var parseConfig = require('./parseConfig');
var parseGlossary = require('./parseGlossary');
var parseSummary = require('./parseSummary');
var parseReadme = require('./parseReadme');
//var parseLanguages = require('./parseLanguages');

/**
    Parse a whole book from a filesystem

    @param {Book} book
    @return {Promise<Book>}
*/
function parseBook(book) {
    return Promise(book)
        .then(parseIgnore)
        .then(parseConfig)
        //.then(parseLanguages)
        .then(parseReadme)
        .then(parseSummary)
        .then(parseGlossary);
}

module.exports = parseBook;
