const encodeFile = require('./encodeFile');
const encodeSummaryPart = require('./encodeSummaryPart');

/**
 * Encode a summary to JSON
 *
 * @param {Summary} summary
 * @param {URIIndex} urls
 * @return {Object}
 */
function encodeSummary(summary, urls) {
    const file = summary.getFile();
    const parts = summary.getParts();

    return {
        file: encodeFile(file, urls),
        parts: parts
            .map(part => encodeSummaryPart(part, urls))
            .toJS()
    };
}

module.exports = encodeSummary;
