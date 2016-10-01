var Immutable = require('immutable');

var timing = require('../utils/timing');
var Page = require('../models/page');
var walkSummary = require('./walkSummary');
var parsePage = require('./parsePage');


/**
    Parse a page from a path

    @param {Book} book
    @param {String} filePath
    @return {Page?}
*/
function parseFilePage(book, filePath) {
    var fs = book.getContentFS();

    return fs.statFile(filePath)
    .then(
        function(file) {
            var page = Page.createForFile(file);
            return parsePage(book, page);
        },
        function(err) {
            // file doesn't exist
            return null;
        }
    )
    .fail(function(err) {
        var logger = book.getLogger();
        logger.error.ln('error while parsing page "' + filePath + '":');
        throw err;
    });
}


/**
    Parse all pages from a book as an OrderedMap

    @param {Book} book
    @return {Promise<OrderedMap<Page>>}
*/
function parsePagesList(book) {
    var summary = book.getSummary();
    var glossary = book.getGlossary();
    var map = Immutable.OrderedMap();

    // Parse pages from summary
    return timing.measure(
        'parse.listPages',
        walkSummary(summary, function(article) {
            if (!article.isPage()) return;

            var filepath = article.getPath();

            // Is the page ignored?
            if (book.isContentFileIgnored(filepath)) return;

            return parseFilePage(book, filepath)
            .then(function(page) {
                // file doesn't exist
                if (!page) {
                    return;
                }

                map = map.set(filepath, page);
            });
        })
    )

    // Parse glossary
    .then(function() {
        var file = glossary.getFile();

        if (!file.exists()) {
            return;
        }

        return parseFilePage(book, file.getPath())
        .then(function(page) {
            // file doesn't exist
            if (!page) {
                return;
            }

            map = map.set(file.getPath(), page);
        });
    })

    .then(function() {
        return map;
    });
}


module.exports = parsePagesList;
