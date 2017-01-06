const is = require('is');
const SummaryArticle = require('../../models/summaryArticle');
const mergeAtLevel = require('./mergeAtLevel');
const indexArticleLevels = require('./indexArticleLevels');

/**
 * Returns a new Summary with the article at the given level, with
 * subsequent article shifted.
 *
 * @param {Summary} summary
 * @param {Article} article
 * @param {String|Article} level: level to insert at
 * @return {Summary}
 */
function insertArticle(summary, article, level) {
    article = new SummaryArticle(article);
    level = is.string(level) ? level : level.getLevel();

    let parent = summary.getParent(level);
    if (!parent) {
        return summary;
    }

    // Find the index to insert at
    let articles = parent.getArticles();
    const index = getLeafIndex(level);

    // Insert the article at the right index
    articles = articles.insert(index, article);

    // Reindex the level from here
    parent = parent.set('articles', articles);
    parent = indexArticleLevels(parent);

    return mergeAtLevel(summary, parent.getLevel(), parent);
}

/**
 * @param {String}
 * @return {Number} The index of this level within its parent's children
 */
function getLeafIndex(level) {
    const arr = level.split('.').map((char) => {
        return parseInt(char, 10);
    });
    return arr[arr.length - 1] - 1;
}

module.exports = insertArticle;
