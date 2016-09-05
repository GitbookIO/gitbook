
/**
    Encode a SummaryArticle to JSON

    @param {SummaryArticle}
    @return {Object}
*/
function encodeSummaryArticle(article, recursive) {
    var articles = undefined;
    if (recursive !== false) {
        articles = article.getArticles()
            .map(encodeSummaryArticle)
            .toJS();
    }

    return {
        title: article.getTitle(),
        level: article.getLevel(),
        depth: article.getDepth(),
        anchor: article.getAnchor(),
        url: article.getUrl(),
        path: article.getPath(),
        ref: article.getRef(),
        articles: articles
    };
}

module.exports = encodeSummaryArticle;
