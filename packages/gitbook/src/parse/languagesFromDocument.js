const { BLOCKS } = require('markup-it');
const Languages = require('../models/languages');
const { listArticles } = require('./summaryFromDocument');

const isList = node => node.type === BLOCKS.OL_LIST || node.type === BLOCKS.UL_LIST;

/**
 * Parse a languages listing from a document.
 * @param  {Document} document
 * @return {Languages} languages
 */
function languagesFromDocument(document) {
    const { nodes } = document;

    const list = nodes.find(isList);

    if (!list) {
        return new Languages();
    }

    const articles = listArticles(list);

    return Languages.createFromList(
        articles
        .filter(article => article.ref)
        .map(article => ({ title: article.title, path: article.ref }))
    );
}

module.exports = languagesFromDocument;
