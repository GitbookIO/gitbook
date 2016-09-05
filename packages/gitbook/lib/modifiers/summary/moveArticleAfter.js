var is = require('is');
var removeArticle = require('./removeArticle');
var insertArticle = require('./insertArticle');

/**
    Returns a new summary, with the an article moved after another
    article. Unlike `moveArticle`, does not ensure that the article
    will be found at the target's level plus one.

    @param {Summary} summary
    @param {String|SummaryArticle} origin
    @param {String|SummaryArticle} afterTarget
    @return {Summary}
*/
function moveArticleAfter(summary, origin, afterTarget) {
    // Coerce to level
    var originLevel = is.string(origin)? origin : origin.getLevel();
    var afterTargetLevel = is.string(afterTarget)? afterTarget : afterTarget.getLevel();
    var article = summary.getByLevel(originLevel);

    var targetLevel = increment(afterTargetLevel);

    if (targetLevel < origin) {
        // Remove first
        var removed = removeArticle(summary, originLevel);
        // Insert then
        return insertArticle(removed, article, targetLevel);
    } else {
        // Insert right after first
        var inserted = insertArticle(summary, article, targetLevel);
        // Remove old one
        return removeArticle(inserted, originLevel);
    }
}

/**
    @param {String}
    @return {Array<Number>}
 */
function levelToArray(l) {
    return l.split('.').map(function (char) {
        return parseInt(char, 10);
    });
}

/**
    @param {Array<Number>}
    @return {String}
 */
function arrayToLevel(a) {
    return a.join('.');
}

function increment(level) {
    level = levelToArray(level);
    level[level.length - 1]++;
    return arrayToLevel(level);
}

module.exports = moveArticleAfter;
