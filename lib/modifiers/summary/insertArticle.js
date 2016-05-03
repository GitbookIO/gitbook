var is = require('is');
var SummaryArticle = require('../../models/summaryArticle');
var editArticle = require('./editArticle');
var indexArticleLevels = require('./indexArticleLevels');

/**
    Insert an article in a summary at a specific position

    @param {Summary} summary
    @param {String|Article} level: level to insert after
    @param {Article} article
    @return {Summary}
*/
function insertArticle(summary, level, article) {
    article = SummaryArticle(article);
    level = is.string(level)? level : level.getLevel();

    var parent = summary.getParent(level);
    if (!parent) {
        return summary;
    }

    // Find the index to insert at
    var articles = parent.getArticles();
    var index = articles.findIndex(function(art) {
        return art.getLevel() === level;
    });
    if (!index) {
        return summary;
    }

    // Insert the article at the right index
    articles = articles.insert(index, article);

    // Reindex the level from here
    parent = parent.set('articles', articles);
    parent = indexArticleLevels(parent);

    return editArticle(summary, parent.getLevel(), parent);
}

module.exports = insertArticle;
