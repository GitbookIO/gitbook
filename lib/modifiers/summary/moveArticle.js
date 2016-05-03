var is = require('is');
var removeArticle = require('./removeArticle');
var insertArticle = require('./insertArticle');

/**
    Remove an article from a level, and insert it after another.

    @param {Summary} summary
    @param {String|SummaryArticle} from: level to remove
    @param {String|SummaryArticle} to: level to insert after
    @return {Summary}
*/
function moveArticle(summary, from, to) {
    // Coerce to level
    var fromLevel = is.string(from)? from : from.getLevel();
    var toLevel = is.string(to)? to : to.getLevel();

    var article = summary.getByLevel(fromLevel);

    // Remove
    var removed = removeArticle(summary, from);

    // Adjust toLevel if removing impacted it
    toLevel = arrayToLevel(
        shiftLevel(levelToArray(fromLevel),
                   levelToArray(toLevel)));
    // Re-insert
    return insertArticle(removed, to, article);
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
    var removedRest = removedLevel.unshift();
    var rest = level.unshift();

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
