var SummaryArticle = require('../../models/summaryArticle');

/**
    Insert an article in a summary, and reindex levels correctly

    @param {Summary} summary
    @param {String} level: level to insert after
    @param {Article} article
    @return {Summary}
*/
function insertArticle(summary, level, article) {
    article = SummaryArticle(article);


}

module.exports = insertArticle;
