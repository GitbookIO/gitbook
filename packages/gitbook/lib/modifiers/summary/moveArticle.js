var is = require('is');
var removeArticle = require('./removeArticle');
var insertArticle = require('./insertArticle');

/**
    Returns a new summary, with the given article removed from its
    origin level, and placed at the given target level.

    @param {Summary} summary
    @param {String|SummaryArticle} origin: level to remove
    @param {String|SummaryArticle} target: the level where the article will be found
    @return {Summary}
*/
function moveArticle(summary, origin, target) {
    // Coerce to level
    var originLevel = is.string(origin)? origin : origin.getLevel();
    var targetLevel = is.string(target)? target : target.getLevel();
    var article = summary.getByLevel(originLevel);

    // Remove first
    var removed = removeArticle(summary, originLevel);
    return insertArticle(removed, article, targetLevel);
}

module.exports = moveArticle;
