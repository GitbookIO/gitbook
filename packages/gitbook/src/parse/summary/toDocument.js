const { Document, Block, Inline, Text } = require('slate');
const { BLOCKS, INLINES } = require('markup-it');

/**
 * Convert an article in a list item node.
 * @param {SummaryArticle} article
 * @return {Block} item
 */
function articleToBlock(article) {
    const { title, ref, articles } = article;
    const text = Text.createFromString(title);

    // Text or link ?
    const innerNode = ref ? Inline.create({
        type: INLINES.LINK,
        nodes: [
            text
        ]
    }) : text;

    const nodes = [
        Block.create({
            type: BLOCKS.TEXT,
            nodes: [
                innerNode
            ]
        })
    ];

    if (articles.size > 0) {
        nodes.push(articlesToBlock(articles));
    }

    return Block.create({
        type: BLOCKS.LIST_ITEM,
        nodes
    });
}

/**
 * Convert a list of articles to a list node.
 * @param {List<SummaryArticle>} articles
 * @return {Block} list
 */
function articlesToBlock(articles) {
    const nodes = articles.map(article => articleToBlock(article));
    return Block.create({
        type: BLOCKS.UL_LIST,
        nodes
    });
}

/**
 * Convert a summary to document.
 * @param  {Summary}  summary
 * @return {Document} document
 */
function summaryToDocument(summary) {
    const { parts } = summary;
    const nodes = [
        Block.create({
            type: BLOCKS.HEADING_1,
            nodes: [
                Text.createFromString('Summary')
            ]
        })
    ];

    parts.forEach(part => {
        const { title, articles } = part;

        if (title) {
            nodes.push(Block.create({
                type: BLOCKS.HEADING_2,
                nodes: [
                    Text.createFromString(title)
                ]
            }));
        } else {
            nodes.push(Block.create({
                type: BLOCKS.HR
            }));
        }

        nodes.push(articlesToBlock(articles));
    });

    return Document.create({ nodes });
}

module.exports = summaryToDocument;
