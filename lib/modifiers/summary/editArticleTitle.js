var editArticle = require('./editArticle');

/**
    Edit title of an article

    @param {Summary} summary
    @param {String} level
    @param {String} newTitle
    @return {Summary}
*/
function editArticleTitle(summary, level, newTitle) {
    return editArticle(summary, level, {
        title: newTitle
    });
}

module.exports = editArticleTitle;
