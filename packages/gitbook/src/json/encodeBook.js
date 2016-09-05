const extend = require('extend');

const gitbook = require('../gitbook');
const encodeSummary = require('./encodeSummary');
const encodeGlossary = require('./encodeGlossary');
const encodeReadme = require('./encodeReadme');
const encodeLanguages = require('./encodeLanguages');

/**
    Encode a book to JSON

    @param {Book}
    @return {Object}
*/
function encodeBookToJson(book) {
    const config = book.getConfig();
    const language = book.getLanguage();

    const variables = config.getValue('variables', {});

    return {
        summary: encodeSummary(book.getSummary()),
        glossary: encodeGlossary(book.getGlossary()),
        readme: encodeReadme(book.getReadme()),
        config: book.getConfig().getValues().toJS(),

        languages: book.isMultilingual() ? encodeLanguages(book.getLanguages()) : undefined,

        gitbook: {
            version: gitbook.version,
            time: gitbook.START_TIME
        },
        book: extend({
            language: language ? language : undefined
        }, variables.toJS())
    };
}

module.exports = encodeBookToJson;
