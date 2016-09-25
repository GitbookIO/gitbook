

/**
 * Fetch a new page and update the store accordingly
 * @param {String} uri
 * @return {Action} action
 */
function fetchPage(uri) {
    return (dispatch, getState) => {

    };
}

/**
 * Fetch a new article
 * @param {SummaryArticle} article
 * @return {Action} action
 */
function fetchArticle(article) {
    return fetchPage(article.path);
}

module.exports = {
    fetchPage,
    fetchArticle
};
