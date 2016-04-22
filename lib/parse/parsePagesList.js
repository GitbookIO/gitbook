var Immutable = require('immutable');

var Page = require('../models/page');
var walkSummary = require('./walkSummary');

/**
    Parse all pages from a book as an OrderedMap

    @param {Book} book
    @return {Promise<OrderedMap<Page>>}
*/
function parsePagesList(book) {
    var fs = book.getContentFS();
    var summary = book.getSummary();
    var map = Immutable.OrderedMap();

    return walkSummary(summary, function(article) {
        if (!article.isPage()) return;

        var filepath = article.getPath();

        // Is the page ignored?
        if (book.isContentFileIgnored(filepath)) return;

        return fs.statFile(filepath)
        .then(function(file) {
            map = map.set(
                filepath,
                Page.createForFile(file)
            );
        });
    })
    .then(function() {
        return map;
    });
}


module.exports = parsePagesList;
