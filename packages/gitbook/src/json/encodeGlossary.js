const encodeFile = require('./encodeFile');
const encodeGlossaryEntry = require('./encodeGlossaryEntry');

/**
    Encode a glossary to JSON

    @param {Glossary}
    @return {Object}
*/
function encodeGlossary(glossary) {
    const file = glossary.getFile();
    const entries = glossary.getEntries();

    return {
        file: encodeFile(file),
        entries: entries
            .map(encodeGlossaryEntry).toJS()
    };
}

module.exports = encodeGlossary;
