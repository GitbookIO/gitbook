var path = require('path');

var parseStructureFile = require('./parseStructureFile');
var Summary = require('../models/summary');
var SummaryModifier = require('../modifiers').Summary;
var location = require('../utils/location');
var Git = require('../utils/git');
var fs = require('../utils/fs');
var walkSummary = require('./walkSummary');

/**
    Create files for summary content references
    to be rendered by a TemplateEngine

    @param {Book} book
    @param {Summary} summary
    @return {Promise<Summary>}
*/
function generateConRefs(book, summary) {
    return walkSummary(summary, function(article) {
        var sourceURL = article.getRef();
        if (!Git.isUrl(sourceURL)) return;

        // Article is a content reference
        var gitUrl = Git.parseUrl(sourceURL);
        var gitFilename = path.basename(gitUrl.filepath);
        var filepath;

        // Generate a unique filename
        return fs.uniqueFilename(book.getRoot(), gitFilename)
        .then(function(uniqueFilename) {
            // Create file containing include
            filepath = path.join(book.getRoot(), uniqueFilename);
            return fs.writeFile(filepath,
                '{% include "'+sourceURL+'" %}'
            );
        })
        .then(function() {
            // Change file in summary article
            filepath = path.relative(book.getRoot(), filepath);
            summary = SummaryModifier.editArticleRef(summary, article.getLevel(), filepath);
        });
    })
    .then(function() {
        return summary;
    });
}

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

        return generateConRefs(book, summary);
    })
    .then(function(summary) {
        // Insert readme as first entry
        var firstArticle = summary.getFirstArticle();

        if (readmeFile.exists() &&
            (!firstArticle || !location.areIdenticalPaths(firstArticle.getRef(), readmeFile.getPath()))) {
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
