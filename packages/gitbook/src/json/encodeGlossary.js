const encodeFile = require('./encodeFile');
const encodeGlossaryEntry = require('./encodeGlossaryEntry');

/**
 * Encode a glossary to JSON
 *
 * @param  {Glossary} glossary
 * @param  {URIIndex} urls
 * @return {JSON} json
 */
function encodeGlossary(glossary, urls) {
    const file = glossary.getFile();
    const entries = glossary.getEntries();

    return {
        file: encodeFile(file, urls),
        entries: entries
            .map(encodeGlossaryEntry).toJS()
    };
}

module.exports = encodeGlossary;
