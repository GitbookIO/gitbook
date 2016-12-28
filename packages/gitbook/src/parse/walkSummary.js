const Promise = require('../utils/promise');

/**
    Walk over a list of articles

    @param {List<Article>} articles
    @param {Function(article)}
    @return {Promise}
*/
function walkArticles(articles, fn) {
    return Promise.forEach(articles, (article) => {
        return Promise(fn(article))
        .then(() => {
            return walkArticles(article.getArticles(), fn);
        });
    });
}

/**
    Walk over summary and execute "fn" on each article

    @param {Summary} summary
    @param {Function(article)}
    @return {Promise}
*/
function walkSummary(summary, fn) {
    const parts = summary.getParts();

    return Promise.forEach(parts, (part) => {
        return walkArticles(part.getArticles(), fn);
    });
}

module.exports = walkSummary;
