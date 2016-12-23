const { BLOCKS } = require('markup-it');
const SummaryArticle = require('../../models/summaryArticle');

const isList = node => node.type === BLOCKS.OL_LIST || node.type === BLOCKS.UL_LIST;

/**
 * Create a summary article from a list item.
 * @param  {Block} item
 * @return {SummaryArticle} article
 */
function createArticleFromItem(item) {
    const { nodes } = item;
    const title = nodes.first().text;
    const list = nodes.skip(1).find(node => isList(node));
    const articles = list ? listArticles(list) : [];

    return SummaryArticle.create({
        title,
        articles
    });
}

/**
 * List articles in a list node.
 * @param  {Block} list
 * @return {List<SummaryArticle>} articles
 */
function listArticles(list) {
    const { nodes } = list;
    return nodes.map(item => createArticleFromItem(item));
}

module.exports = listArticles;
