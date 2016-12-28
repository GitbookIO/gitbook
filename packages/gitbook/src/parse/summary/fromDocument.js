const Summary = require('../../models/summary');

const { BLOCKS, INLINES } = require('markup-it');
const { List } = require('immutable');

const isList = node => node.type === BLOCKS.OL_LIST || node.type === BLOCKS.UL_LIST;
const isLink = node => node.type === INLINES.LINK;

/**
 * Create a summary article from a list item.
 * @param  {Block} item
 * @param  {String} level
 * @return {SummaryArticleLike} article
 */
function createArticleFromItem(item) {
    const { nodes } = item;

    const titleParent = nodes.first();
    const list = nodes.skip(1).find(isList);
    const articles = list ? listArticles(list) : [];
    const title = titleParent.text;
    const link = titleParent.findDescendant(isLink);
    const ref = link ? link.data.get('href') : null;

    return {
        title,
        ref,
        articles
    };
}

/**
 * List articles in a list node.
 * @param  {Block} list
 * @return {List<SummaryArticleLike>} articles
 */
function listArticles(list) {
    const { nodes } = list;
    return nodes.map(item => createArticleFromItem(item));
}

/**
 * List summary parts in a document.
 * @param  {Document} document
 * @return {List<SummaryPart>} parts
 */
function listParts(document) {
    const { nodes } = document;
    const parts = [];
    let title = '';

    nodes.forEach((node) => {
        const isHeading = (
            node.type == BLOCKS.HEADING_2 ||
            node.type == BLOCKS.HEADING_3
        );

        if (isHeading) {
            title = node.text;
        }

        if (isList(node)) {
            const articles = listArticles(node);
            parts.push({
                title,
                articles
            });

            title = '';
        }
    });

    return List(parts);
}

/**
 * Parse a summary from a document.
 * @param  {Document} document
 * @return {Summary} summary
 */
function summaryFromDocument(document) {
    const parts = listParts(document);
    return Summary.createFromParts(parts);
}

module.exports = summaryFromDocument;
