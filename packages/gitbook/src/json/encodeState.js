const gitbook = require('../gitbook');
const encodeSummary = require('./encodeSummary');
const encodeGlossary = require('./encodeGlossary');
const encodeReadme = require('./encodeReadme');
const encodeLanguages = require('./encodeLanguages');
const encodePage = require('./encodePage');
const encodeFile = require('./encodeFile');

/**
 * Encode context to JSON from an output instance.
 * This JSON representation is used as initial state for the redux store.
 *
 * @param  {Output} output
 * @param  {Page} page
 * @return {JSON}
 */
function encodeStateToJSON(output, page) {
    const book = output.getBook();
    const urls = output.getURLIndex();
    const file = page.getFile();

    return {
        output: {
            name: output.getGenerator()
        },
        gitbook: {
            version: gitbook.version,
            time:    gitbook.START_TIME
        },

        summary: encodeSummary(book.getSummary(), urls),
        glossary: encodeGlossary(book.getGlossary(), urls),
        readme: encodeReadme(book.getReadme(), urls),
        config: book.getConfig().getValues().toJS(),
        languages: book.isMultilingual() ? encodeLanguages(book.getLanguages()) : undefined,

        page: encodePage(page, book.getSummary(), urls),
        file: encodeFile(file, urls)
    };
}

module.exports = encodeStateToJSON;
