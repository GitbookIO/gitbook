
/**
    Index levels in an article tree

    @param {Article}
    @param {String} baseLevel
    @return {Article}
*/
function indexArticleLevels(article, baseLevel) {
    baseLevel = baseLevel || article.getLevel();
    var articles = article.getArticles();

    articles = articles.map(function(inner, i) {
        return indexArticleLevels(inner, baseLevel + '.' + (i + 1));
    });

    return article.merge({
        level: baseLevel,
        articles: articles
    });
}

module.exports = indexArticleLevels;
