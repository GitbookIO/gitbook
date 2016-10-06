const encodeFile = require('./encodeFile');
const encodeSummaryPart = require('./encodeSummaryPart');

/**
 * Encode a summary to JSON
 *
 * @param {Summary}
 * @return {Object}
 */
function encodeSummary(summary) {
    const file = summary.getFile();
    const parts = summary.getParts();

    return {
        file: encodeFile(file),
        parts: parts.map(encodeSummaryPart).toJS()
    };
}

module.exports = encodeSummary;
