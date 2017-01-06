const { BLOCKS } = require('markup-it');
const Readme = require('../models/readme');

/**
 * Parse a readme from a document.
 * @param  {Document} document
 * @return {Readme} readme
 */
function readmeFromDocument(document) {
    const { nodes } = document;

    const first = nodes.first();
    const second = nodes.get(1);

    return Readme.create({
        title: first && first.type == BLOCKS.HEADING_1 ? first.text : '',
        description: second && second.type == BLOCKS.PARAGRAPH ? second.text : ''
    });
}

module.exports = readmeFromDocument;
