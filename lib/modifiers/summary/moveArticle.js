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

    // Remove
    var removed = removeArticle(summary, origin);

    // Adjust targetLevel if removing impacted it
    targetLevel = arrayToLevel(
        shiftLevel(levelToArray(originLevel),
                   levelToArray(targetLevel)));
    // Re-insert
    return insertArticle(removed, target, article);
}

/**
    @param {Array<Number>} removedLevel
    @param {Array<Number>} level The level to udpate
    @return {Array<Number>}
 */
function shiftLevel(removedLevel, level) {
    if (level.length === 0) {
        // `removedLevel` is under level, so no effect
        return level;
    } else if (removedLevel.length === 0) {
        // Either `level` is a child of `removedLevel`... or they are equal
        // This is undefined behavior.
        return level;
    }

    var removedRoot = removedLevel[0];
    var root = level[0];
    var removedRest = removedLevel.slice(1);
    var rest = level.slice(1);

    if (removedRoot < root) {
        // It will shift levels at this point. The rest is unchanged.
        return Array.prototype.concat(root - 1, rest);
    } else if (removedRoot === root) {
        // Look deeper
        return Array.prototype.concat(root, shiftLevel(removedRest, rest));
    } else {
        // No impact
        return level;
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

module.exports = moveArticle;
