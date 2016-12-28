const Summary = require('../../models/summary');
const listParts = require('./listParts');

/**
 * Parse a summary from a document.
 * @param  {Document} document
 * @return {Summary} summary
 */
function summaryFromDocument(document) {
    const parts = listParts(document);
    return new Summary({
        parts
    });
}

module.exports = summaryFromDocument;
