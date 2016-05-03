var is = require('is');
var editArticle = require('./editArticle');
var indexArticleLevels = require('./indexArticleLevels');

/**
    Remove an article from a level.

    @param {Summary} summary
    @param {String|SummaryArticle} level: level to remove
    @return {Summary}
*/
function removeArticle(summary, level) {
    // Coerce to level
    level = is.string(level)? level : level.getLevel();

    var parent = summary.getParent(summary, level);

    // Find the index to remove
    var index = articles.findIndex(function(art) {
        return art.getLevel() === level;
    });
    if (!index) {
        return summary;
    }

    // Remove from children
    var articles = parent.getArticles().remove(index);
    parent = parent.set('articles', articles);

    // Reindex the level from here
    parent = indexArticleLevels(parent);

    return editArticle(summary, parent.getLevel(), parent);
}

module.exports = removeArticle;
