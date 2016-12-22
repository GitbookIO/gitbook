
/**
 * Encode a SummaryArticle to JSON
 *
 * @param  {SummaryArticle} article
 * @param  {URIIndex} urls
 * @param  {Boolean} recursive
 * @return {Object}
 */
function encodeSummaryArticle(article, urls, recursive) {
    let articles = undefined;
    if (recursive !== false) {
        articles = article.getArticles()
            .map(innerArticle => encodeSummaryArticle(innerArticle, urls, recursive))
            .toJS();
    }

    return {
        title:  article.getTitle(),
        level:  article.getLevel(),
        depth:  article.getDepth(),
        anchor: article.getAnchor(),
        url:    urls.resolveToURL(article.getPath() || article.getUrl()),
        path:   article.getPath(),
        ref:    article.getRef(),
        articles
    };
}

module.exports = encodeSummaryArticle;
