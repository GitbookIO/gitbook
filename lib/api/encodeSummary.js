var encodeSummaryArticle = require('../json/encodeSummaryArticle');

/**
    Encode summary to provide an API to plugin

    @param {Output} output
    @param {Config} config
    @return {Object}
*/
function encodeSummary(output, summary) {
    var result = {
        /**
            Iterate over the summary, it stops when the "iter" returns false

            @param {Function} iter
        */
        walk: function (iter) {
            summary.getArticle(function(article) {
                var jsonArticle = encodeSummaryArticle(article, false);

                return iter(jsonArticle);
            });
        },

        /**
            Get an article by its level

            @param {String} level
            @return {Object}
        */
        getArticleByLevel: function(level) {
            var article = summary.getByLevel(level);
            return (article? encodeSummaryArticle(article) : undefined);
        },

        /**
            Get an article by its path

            @param {String} level
            @return {Object}
        */
        getArticleByPath: function(level) {
            var article = summary.getByPath(level);
            return (article? encodeSummaryArticle(article) : undefined);
        }
    };

    return result;
}

module.exports = encodeSummary;
