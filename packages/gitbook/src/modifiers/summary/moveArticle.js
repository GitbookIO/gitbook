const is = require('is');
const removeArticle = require('./removeArticle');
const insertArticle = require('./insertArticle');

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
    const originLevel = is.string(origin) ? origin : origin.getLevel();
    const targetLevel = is.string(target) ? target : target.getLevel();
    const article = summary.getByLevel(originLevel);

    // Remove first
    const removed = removeArticle(summary, originLevel);
    return insertArticle(removed, article, targetLevel);
}

module.exports = moveArticle;
