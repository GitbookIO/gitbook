const encodeSummaryArticle = require('./encodeSummaryArticle');

/**
 * Return a JSON representation of a page.
 *
 * @param  {Page} page
 * @param  {Summary} summary
 * @param  {URIIndex} urls
 * @return {JSON} json
 */
function encodePage(page, summary, urls) {
    const file = page.getFile();
    const attributes = page.getAttributes();
    const article = summary.getByPath(file.getPath());

    const result = {
        content:    page.getContent(),
        dir:        page.getDir(),
        attributes: attributes.toJS()
    };

    if (article) {
        result.title = article.getTitle();
        result.level = article.getLevel();
        result.depth = article.getDepth();

        const nextArticle = summary.getNextArticle(article);
        if (nextArticle) {
            result.next = encodeSummaryArticle(nextArticle, urls, false);
        }

        const prevArticle = summary.getPrevArticle(article);
        if (prevArticle) {
            result.previous = encodeSummaryArticle(prevArticle, urls, false);
        }
    }

    return result;
}

module.exports = encodePage;
