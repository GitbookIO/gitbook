const encodeSummaryArticle = require('./encodeSummaryArticle');

/**
 * Encode a SummaryPart to JSON.
 *
 * @param  {SummaryPart} part
 * @param  {URIIndex} urls
 * @return {JSON} json
 */
function encodeSummaryPart(part, urls) {
    return {
        title: part.getTitle(),
        articles: part.getArticles()
            .map(article => encodeSummaryArticle(article, urls))
            .toJS()
    };
}

module.exports = encodeSummaryPart;
