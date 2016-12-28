const { BLOCKS, INLINES } = require('markup-it');
const SummaryArticle = require('../../models/summaryArticle');

const isList = node => node.type === BLOCKS.OL_LIST || node.type === BLOCKS.UL_LIST;
const isLink = node => node.type === INLINES.LINK;

/**
 * Create a summary article from a list item.
 * @param  {Block} item
 * @return {SummaryArticle} article
 */
function createArticleFromItem(item) {
    const { nodes } = item;

    const titleParent = nodes.first();
    const list = nodes.skip(1).find(isList);
    const articles = list ? listArticles(list) : [];
    const title = titleParent.text;
    const link = titleParent.findDescendant(isLink);
    const href = link ? link.data.get('href') : null;

    return SummaryArticle.create({
        title,
        href,
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
