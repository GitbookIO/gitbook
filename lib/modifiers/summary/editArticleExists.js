var mergeAtLevel = require('./mergeAtLevel');

/**
    Edit the exists property of an article

    @param {Summary} summary
    @param {String} level
    @param {Boolean} exists
    @return {Summary}
*/
function editArticleExists(summary, level, exists) {
    return mergeAtLevel(summary, level, {
        exists: exists
    });
}

module.exports = editArticleExists;
