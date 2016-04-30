
/**
    Edit a list of articles

    @param {List<Article>} articles
    @param {String} level
    @param {Article} newArticle
    @return {List<Article>}
*/
function editArticleInList(articles, level, newArticle) {
    return articles.map(function(article) {
        var articleLevel = article.getLevel();

        if (articleLevel == level) {
            return article.merge(newArticle);
        }

        if (level.indexOf(articleLevel) === 0) {
            var articles = editArticleInList(article.getArticles(), level, newArticle);
            return article.set('articles', articles);
        }

        return article;
    });
}


/**
    Edit an article in a part

    @param {Part} part
    @param {String} level
    @param {Article} newArticle
    @return {Part}
*/
function editArticleInPart(part, level, newArticle) {
    var articles = part.getArticles();
    articles = editArticleInList(articles);

    return part.set('articles', articles);
}


/**
    Edit an article in a summary

    @param {Summary} summary
    @param {String} level
    @param {Article} newArticle
    @return {Summary}
*/
function editArticle(summary, level, newArticle) {
    var parts = summary.getParts();

    var levelParts = level.split('.');
    var partIndex = Number(levelParts[0]);

    var part = parts.get(partIndex);
    if (!part) {
        return summary;
    }

    part = editArticleInPart(part, level, newArticle);
    parts = parts.set(partIndex, part);

    return summary.set('parts', parts);
}


module.exports = editArticle;
