const encodeSummaryArticle = require('../json/encodeSummaryArticle');

/**
    Encode summary to provide an API to plugin

    @param {Output} output
    @param {Config} config
    @return {Object}
*/
function encodeSummary(output, summary) {
    const result = {

        /**
            Iterate over the summary, it stops when the "iter" returns false

            @param {Function} iter
        */
        walk(iter) {
            summary.getArticle(function(article) {
                const jsonArticle = encodeSummaryArticle(article, false);

                return iter(jsonArticle);
            });
        },

        /**
            Get an article by its level

            @param {String} level
            @return {Object}
        */
        getArticleByLevel(level) {
            const article = summary.getByLevel(level);
            return (article ? encodeSummaryArticle(article) : undefined);
        },

        /**
            Get an article by its path

            @param {String} level
            @return {Object}
        */
        getArticleByPath(level) {
            const article = summary.getByPath(level);
            return (article ? encodeSummaryArticle(article) : undefined);
        }
    };

    return result;
}

module.exports = encodeSummary;
