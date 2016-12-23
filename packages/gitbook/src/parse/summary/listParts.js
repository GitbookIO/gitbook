const { BLOCKS } = require('markup-it');
const { List } = require('immutable');

const listArticles = require('./listArticles');
const SummaryPart = require('../../models/summaryPart');

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
        const isList = (
            node.type == BLOCKS.OL_LIST ||
            node.type == BLOCKS.UL_LIST
        );

        if (isHeading) {
            title = node.text;
        }

        if (isList) {
            const articles = listArticles(node);
            parts.push(SummaryPart.create({
                title,
                articles
            }));

            title = '';
        }
    });

    return List(parts);
}

module.exports = listParts;
