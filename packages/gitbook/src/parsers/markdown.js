const { State } = require('markup-it');
const markdown = require('markup-it/lib/markdown');
const html = require('markup-it/lib/html');
const annotateCodeBlocks = require('./annotateCodeBlocks');

const FILE_EXTENSIONS = [
    '.md',
    '.markdown',
    '.mdown'
];

/**
 * Render a document as markdown.
 * @param  {Document} document
 * @return {String} text
 */
function toText(document) {
    const state = State.create(markdown);
    return state.serializeDocument(document);
}

/**
 * Parse markdown into a document.
 * @param  {String} text
 * @return {Document} document
 */
function toDocument(text) {
    const state = State.create(markdown);
    return state.deserializeToDocument(text);
}

/**
 * Prepare a document for parsing
 * @param  {String} text
 * @return {String} text
 */
function prepare(text) {
    let doc = toDocument(text);
    doc = annotateCodeBlocks(doc);
    return toText(doc);
}

/**
 * Render markdown to HTML.
 * @param  {String} text
 * @param  {Object} context
 * @return {String} html
 */
function toHTML(text, context) {
    const document = toDocument(text);
    const state = State.create(html);

    return state.serializeDocument(document);
}

/**
 * Render markdown to inline HTML.
 * @param  {String} text
 * @return {String} html
 */
function toInlineHTML(text) {
    const document = toDocument(text);
    const state = State.create(html);

    return state.serializeDocument(document);
}

module.exports = {
    name: 'markdown',
    FILE_EXTENSIONS,
    prepare,
    toText,
    toDocument,
    toHTML,
    toInlineHTML
};
