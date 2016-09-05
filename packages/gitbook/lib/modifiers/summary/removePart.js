var indexLevels = require('./indexLevels');

/**
    Remove a part at given index

    @param {Summary} summary
    @param {Number|} index
    @return {Summary}
*/
function removePart(summary, index) {
    var parts = summary.getParts().remove(index);
    return indexLevels(summary.set('parts', parts));
}

module.exports = removePart;
