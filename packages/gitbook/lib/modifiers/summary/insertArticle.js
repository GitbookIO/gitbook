var is = require('is');
var SummaryArticle = require('../../models/summaryArticle');
var mergeAtLevel = require('./mergeAtLevel');
var indexArticleLevels = require('./indexArticleLevels');

/**
    Returns a new Summary with the article at the given level, with
    subsequent article shifted.

    @param {Summary} summary
    @param {Article} article
    @param {String|Article} level: level to insert at
    @return {Summary}
*/
function insertArticle(summary, article, level) {
    article = SummaryArticle(article);
    level = is.string(level)? level : level.getLevel();

    var parent = summary.getParent(level);
    if (!parent) {
        return summary;
    }

    // Find the index to insert at
    var articles = parent.getArticles();
    var index = getLeafIndex(level);

    // Insert the article at the right index
    articles = articles.insert(index, article);

    // Reindex the level from here
    parent = parent.set('articles', articles);
    parent = indexArticleLevels(parent);

    return mergeAtLevel(summary, parent.getLevel(), parent);
}

/**
    @param {String}
    @return {Number} The index of this level within its parent's children
 */
function getLeafIndex(level) {
    var arr = level.split('.').map(function (char) {
        return parseInt(char, 10);
    });
    return arr[arr.length - 1] - 1;
}

module.exports = insertArticle;
