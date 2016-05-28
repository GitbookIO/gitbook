var Immutable = require('immutable');

var timing = require('../utils/timing');
var Page = require('../models/page');
var walkSummary = require('./walkSummary');
var parsePage = require('./parsePage');
var summaryModifier = require('../modifiers/summary');


/**
    Parse a page from a path

    @param {Book} book
    @param {String} filePath
    @return {Page}
*/
function parseFilePage(book, filePath) {
    var fs = book.getContentFS();

    return fs.statFile(filePath)
    .then(function(file) {
        var page = Page.createForFile(file);
        return parsePage(book, page);
    });
}


/**
    Parse all pages from a book as an OrderedMap
    and update book's summary with non-existing pages

    @param {Book} book
    @return {Promise<Object {book: Book, pages: OrderedMap}>}
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
                map = map.set(filepath, page);
            }, function() {
                // file doesn't exist
                // delete ref in summary
                summary = summaryModifier.editArticleRef(summary, article.getLevel(), null);
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
            map = map.set(file.getPath(), page);
        });
    })

    .then(function() {
        book = book.setSummary(summary);

        return {
            book: book,
            pages: map
        };
    });
}


module.exports = parsePagesList;
