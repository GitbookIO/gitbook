var SummaryPart = require('../../models/summaryPart');
var indexLevels = require('./indexLevels');

/**
    Returns a new Summary with a part inserted at given index

    @param {Summary} summary
    @param {Part} part
    @param {Number} index
    @return {Summary}
*/
function insertPart(summary, part, index) {
    part = SummaryPart(part);

    var parts = summary.getParts().insert(index, part);
    return indexLevels(summary.set('parts', parts));
}

module.exports = insertPart;
