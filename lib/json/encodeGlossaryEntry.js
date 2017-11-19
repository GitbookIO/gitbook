/**
    Encode a SummaryArticle to JSON

    @param {GlossaryEntry}
    @return {Object}
*/
function encodeGlossaryEntry(entry) {
    return {
        id: entry.getID(),
        name: entry.getName(),
        description: entry.getDescription(),
    };
}

module.exports = encodeGlossaryEntry;
