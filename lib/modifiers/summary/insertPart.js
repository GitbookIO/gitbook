var SummaryPart = require('../../models/summaryPart');
var indexLevels = require('./indexLevels');

/**
    Returns a new Summary with a part inserted at given index

    @param {Summary} summary
    @param {Number} index
    @param {Part} part
    @return {Summary}
*/
function insertPart(summary, index, part) {
    part = SummaryPart(part);

    var parts = summary.getParts().insert(index, part);
    return indexLevels(summary.set('parts', parts));
}

module.exports = insertPart;
