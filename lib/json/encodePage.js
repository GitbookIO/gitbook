var encodeSummaryArticle = require('./encodeSummaryArticle');

/**
    Return a JSON representation of a page

    @param {Page} page
    @param {Summary} summary
    @return {Object}
*/
function encodePage(page, summary) {
    var file = page.getFile();
    var attributes = page.getAttributes();
    var article = summary.getByPath(file.getPath());

    var result = attributes.toJS();

    if (article) {
        result.title = article.getTitle();
        result.level = article.getLevel();
        result.depth = article.getDepth();

        var nextArticle = summary.getNextArticle(article);
        if (nextArticle) {
            result.next = encodeSummaryArticle(nextArticle);
        }

        var prevArticle = summary.getPrevArticle(article);
        if (prevArticle) {
            result.previous = encodeSummaryArticle(prevArticle);
        }
    }

    result.content = page.getContent();
    result.dir = page.getDir();

    return result;
}

module.exports = encodePage;
