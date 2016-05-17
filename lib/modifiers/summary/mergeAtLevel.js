
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

        if (articleLevel === level) {
            // it is the article to edit
            return article.merge(newArticle);
        } else if (level.indexOf(articleLevel) === 0) {
            // it is a parent
            var articles = editArticleInList(article.getArticles(), level, newArticle);
            return article.set('articles', articles);
        } else {
            // This is not the article you are looking for
            return article;
        }
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
    articles = editArticleInList(articles, level, newArticle);

    return part.set('articles', articles);
}


/**
    Edit an article, or a part, in a summary. Does a shallow merge.

    @param {Summary} summary
    @param {String} level
    @param {Article|Part} newValue
    @return {Summary}
*/
function mergeAtLevel(summary, level, newValue) {
    var levelParts = level.split('.');
    var partIndex = Number(levelParts[0]) -1;

    var parts = summary.getParts();
    var part = parts.get(partIndex);
    if (!part) {
        return summary;
    }

    var isEditingPart = levelParts.length < 2;
    if (isEditingPart) {
        part = part.merge(newValue);
    } else {
        part = editArticleInPart(part, level, newValue);
    }

    parts = parts.set(partIndex, part);
    return summary.set('parts', parts);
}


module.exports = mergeAtLevel;
