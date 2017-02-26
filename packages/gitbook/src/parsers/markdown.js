const { State } = require('markup-it');
const markdown = require('markup-it/lib/markdown');
const html = require('markup-it/lib/html');

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
 * Render markdown to HTML.
 * @param  {String} text
 * @return {String} html
 */
function toHTML(text) {
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
    toText,
    toDocument,
    toHTML,
    toInlineHTML
};
