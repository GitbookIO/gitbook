const { BLOCKS } = require('markup-it');
const Glossary = require('../models/glossary');

/**
 * Return true if a node is a entry title.
 * @param  {Node} node
 * @return {Boolean}
 */
const isTitle = node => node.type == BLOCKS.HEADING_2;

/**
 * Return true if a node is a entry description.
 * @param  {Node} node
 * @return {Boolean}
 */
const isDescription = node => node.type !== BLOCKS.HEADING_2 && node.type !== BLOCKS.CODE;

/**
 * Parse a readme from a document.
 * @param  {Document} document
 * @return {Readme} readme
 */
function glossaryFromDocument(document) {
    const { nodes } = document;
    const entries = [];

    nodes.forEach((block, i) => {
        const next = nodes.get(i);

        if (isTitle(block)) {
            entries.push({
                name:        block.text,
                description: (next && isDescription(next)) ? next.text : ''
            });
        }
    });


    return Glossary.createFromEntries(entries);
}

module.exports = glossaryFromDocument;
