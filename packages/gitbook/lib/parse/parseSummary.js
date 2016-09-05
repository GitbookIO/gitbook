var parseStructureFile = require('./parseStructureFile');
var Summary = require('../models/summary');
var SummaryModifier = require('../modifiers').Summary;

/**
    Parse summary in a book, the summary can only be parsed
    if the readme as be detected before.

    @param {Book} book
    @return {Promise<Book>}
*/
function parseSummary(book) {
    var readme = book.getReadme();
    var logger = book.getLogger();
    var readmeFile = readme.getFile();

    return parseStructureFile(book, 'summary')
    .spread(function(file, result) {
        var summary;

        if (!file) {
            logger.warn.ln('no summary file in this book');
            summary = Summary();
        } else {
            logger.debug.ln('summary file found at', file.getPath());
            summary = Summary.createFromParts(file, result.parts);
        }

        // Insert readme as first entry if not in SUMMARY.md
        var readmeArticle = summary.getByPath(readmeFile.getPath());

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
