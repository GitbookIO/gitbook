var Immutable = require('immutable');

var timing = require('../utils/timing');
var Page = require('../models/page');
var walkSummary = require('./walkSummary');
var parsePage = require('./parsePage');

/**
    Parse all pages from a book as an OrderedMap

    @param {Book} book
    @return {Promise<OrderedMap<Page>>}
*/
function parsePagesList(book) {
    var fs = book.getContentFS();
    var summary = book.getSummary();
    var map = Immutable.OrderedMap();

    return timing.measure(
        'parse.listPages',
        walkSummary(summary, function(article) {
            if (!article.isPage()) return;

            var filepath = article.getPath();

            // Is the page ignored?
            if (book.isContentFileIgnored(filepath)) return;

            return fs.statFile(filepath)
            .then(function(file) {
                var page = Page.createForFile(file);
                return parsePage(book, page);
            })
            .then(function(page) {
                map = map.set(filepath, page);
            }, function() {
                // file doesn't exist
            });
        })
        .then(function() {
            return map;
        })
    );
}


module.exports = parsePagesList;
