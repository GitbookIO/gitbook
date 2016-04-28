var is = require('is');
var SummaryArticle = require('../../models/summaryArticle');
var editArticle = require('./editArticle');
var indexArticleLevels = require('./indexArticleLevels');


/**
    Get level of parent of an article

    @param {String} level
    @return {String}
*/
function getParentLevel(level) {
    var parts = level.split('.');
    return parts.slice(0, -1).join('.');
}

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

    var parentLevel = getParentLevel(level);

    if (!parentLevel) {
        // todo: insert new part
        return summary;
    }

    // Get parent of the position
    var parentArticle = summary.getByLevel(parentLevel);
    if (!parentLevel) {
        return summary;
    }

    // Find the index to insert at
    var articles = parentArticle.getArticles();
    var index = articles.findIndex(function(art) {
        return art.getLevel() === level;
    });
    if (!index) {
        return summary;
    }

    // Insert the article at the right index
    articles = articles.insert(index, article);

    // Reindex the level from here
    parentArticle = parentArticle.set('articles', articles);
    parentArticle = indexArticleLevels(parentArticle);

    return editArticle(summary, parentLevel, parentArticle);

}

module.exports = insertArticle;
