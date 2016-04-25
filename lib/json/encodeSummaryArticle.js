
/**
    Encode a SummaryArticle to JSON

    @param {SummaryArticle}
    @return {Object}
*/
function encodeSummaryArticle(article) {
    return {
        title: article.getTitle(),
        level: article.getLevel(),
        depth: article.getDepth(),
        anchor: article.getAnchor(),
        url: article.getUrl(),
        path: article.getPath(),
        articles: article.getArticles()
            .map(encodeSummaryArticle).toJS()
    };
}

module.exports = encodeSummaryArticle;
