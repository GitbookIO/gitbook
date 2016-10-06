
/**
 * Encode a SummaryArticle to JSON
 *
 * @param {SummaryArticle}
 * @return {Object}
 */
function encodeSummaryArticle(article, recursive) {
    let articles = undefined;
    if (recursive !== false) {
        articles = article.getArticles()
            .map(encodeSummaryArticle)
            .toJS();
    }

    return {
        title:  article.getTitle(),
        level:  article.getLevel(),
        depth:  article.getDepth(),
        anchor: article.getAnchor(),
        url:    article.getUrl(),
        path:   article.getPath(),
        ref:    article.getRef(),
        articles
    };
}

module.exports = encodeSummaryArticle;
