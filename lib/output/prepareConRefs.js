var Immutable = require('immutable');

var Page = require('../models/page');
var walkSummary = require('../parse/walkSummary');

/**
    List and prepare all content references from summary

    @param {Output}
    @return {Promise<Output>}
*/
function prepareConRefs(output) {
    var book    = output.getBook();
    var logger  = book.getLogger();
    var summary = book.getSummary();

    var conrefs = Immutable.OrderedMap();

    return walkSummary(summary, function(article) {
        // Is the page a git content reference?
        if (!article.isConRef()) return;

        var filepath = article.getPath();
        return conrefs = conrefs.set(
            filepath,
            new Page()
        );
    })
    .then(function() {
        logger.info.ln('found', conrefs.size, 'content references');

        var pages = output.getPages();
        pages = pages.merge(conrefs);

        return output.set('pages', pages);
    });
}

module.exports = prepareConRefs;