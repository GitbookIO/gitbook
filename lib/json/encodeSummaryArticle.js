
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
        articles: article.getArticles()
            .map(encodeSummaryArticle).toJS()
    };
}

module.exports = encodeSummaryArticle;
