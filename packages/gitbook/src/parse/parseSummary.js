const { BLOCKS } = require('markup-it');

const parseStructureFile = require('./parseStructureFile');
const Summary = require('../models/summary');
const SummaryPart = require('../models/summaryPart');
const SummaryModifier = require('../modifiers').Summary;

/**
 * Extract parts from a Slate document.
 * @param  {Slate.Document} document
 * @return {Array<Part>} parts
 */
function listPartsFromDocuments(document) {
    const { nodes } = document;
    const parts = [];

    nodes.forEach((node) => {
        if (node.type == )
    });

    return parts;
}

/**
 * Parse summary in a book, the summary can only be parsed
 * if the readme as be detected before.
 *
 * @param {Book} book
 * @return {Promise<Book>}
 */
function parseSummary(book) {
    const readme = book.getReadme();
    const logger = book.getLogger();
    const readmeFile = readme.getFile();

    return parseStructureFile(book, 'summary')
    .spread((file, result) => {
        let summary;

        if (!file) {
            logger.warn.ln('no summary file in this book');
            summary = Summary();
        } else {
            logger.debug.ln('summary file found at', file.getPath());
            summary = Summary.createFromParts(file, result.parts);
        }

        // Insert readme as first entry if not in SUMMARY.md
        const readmeArticle = summary.getByPath(readmeFile.getPath());

        if (readmeFile.exists() && !readmeArticle) {
            summary = SummaryModifier.unshiftArticle(summary, {
                title: 'Introduction',
                ref: readmeFile.getPath()
            });
        }

        // Set new summary
        return book.setSummary(summary);
    });
}

module.exports = parseSummary;
