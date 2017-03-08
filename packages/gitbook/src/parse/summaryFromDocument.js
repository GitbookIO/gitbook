const Summary = require('../models/summary');

const { BLOCKS, INLINES } = require('markup-it');
const { List } = require('immutable');

const isList = node => node.type === BLOCKS.OL_LIST || node.type === BLOCKS.UL_LIST;
const isLink = node => node.type === INLINES.LINK;

/**
 * Create a summary article from a list item.
 * @param  {Block} item
 * @return {SummaryArticleLike | Null} article
 */
function createArticleFromItem(item) {
    const { nodes } = item;

    // Find the link that represents the article's title
    const linkParent = nodes
        .filterNot(isList)
        .find(node => node.findDescendant(isLink));

    // Or find text that could act as title
    const textParent = nodes.filterNot(node => isList(node) || node.isEmpty).first();

    let title, ref, parent;
    if (linkParent) {
        const link = linkParent.findDescendant(isLink);

        if (!link.isEmpty) {
            parent = linkParent;
            title = link.text;
            ref = link.data.get('href');
        }
    }

    if (!parent) {
        // Could not find a proper link

        if (textParent) {
            parent = textParent;
            title = textParent.text;
            ref = null;
        } else {
            // This item has no proper title or link
            return null;
        }
    }

    const list = nodes
        // Skip until after the article's title or link
        .skipUntil(node => node === parent).skip(1)
        .find(isList);
    const articles = list ? listArticles(list) : [];

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
    return nodes
        .map(item => createArticleFromItem(item))
        .filter(article => Boolean(article));
}

/**
 * List summary parts in a document.
 * @param  {Document} document
 * @return {List<SummaryPart>} parts
 */
function listParts(document) {
    const { nodes } = document;
    const parts = [];

    // Keep a reference to a part, waiting for its articles
    let pendingPart;

    nodes.forEach((node) => {
        const isHeading = (
            node.type == BLOCKS.HEADING_2 ||
            node.type == BLOCKS.HEADING_3
        );

        if (isHeading) {
            if (pendingPart) {
                // The previous was empty
                parts.push(pendingPart);
            }
            pendingPart = {
                title: node.text
            };
        }

        if (isList(node)) {
            const articles = listArticles(node);

            if (pendingPart) {
                pendingPart.articles = articles;
                parts.push(pendingPart);
                pendingPart = undefined;
            } else {
                parts.push({
                    title: '',
                    articles
                });
            }
        }
    });

    if (pendingPart) {
        // The last one was empty
        parts.push(pendingPart);
    }

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
module.exports.listArticles = listArticles;
module.exports.createArticleFromItem = createArticleFromItem;
