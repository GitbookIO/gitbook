
/**
 * Encode a SummaryArticle to JSON
 *
 * @param {GlossaryEntry} entry
 * @return {JSON} json
 */
function encodeGlossaryEntry(entry) {
    return {
        id: entry.getID(),
        name: entry.getName(),
        description: entry.getDescription()
    };
}

module.exports = encodeGlossaryEntry;
