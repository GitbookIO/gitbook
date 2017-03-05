const { State } = require('markup-it');
const AsciidoctorJS = require('asciidoctor.js');
const asciidoc = require('markup-it/lib/asciidoc');

const asciidocjs = AsciidoctorJS();

const FILE_EXTENSIONS = [
    '.adoc',
    '.asciidoc'
];

function getAttributes(defaultAttributes, context) {
    const asciidocConfig = context.config.pluginsConfig.asciidoc;
    let userAttributes;
    if (asciidocConfig === undefined) {
        userAttributes = [];
    } else {
        userAttributes = asciidocConfig.attributes || [];
    }
    return [...defaultAttributes, ...userAttributes];
}

/**
 * Render a document as text.
 * @param  {Document} document
 * @return {String} text
 */
function toText(document) {
    const state = State.create(asciidoc);
    return state.serializeDocument(document);
}

/**
 * Parse asciidoc into a document.
 * @param  {String} text
 * @return {Document} document
 */
function toDocument(text) {
    const state = State.create(asciidoc);
    return state.deserializeToDocument(text);
}

/**
 * Render asciidoc to HTML.
 * @param  {String} text
 * @param  {Object} context
 * @return {String} html
 */
function toHTML(text, context) {
    const attributes = getAttributes(['showtitle'], context);
    return asciidocjs.convert(text, {
        attributes
    });
}

/**
 * Prepare a document for parsing
 * @param  {String} text
 * @return {String} text
 */
function prepare(text) {
    return text;
}

/**
 * Render asciidoc to inline HTML.
 * @param  {String} text
 * @return {String} html
 */
function toInlineHTML(text) {
    return asciidocjs.convert(text, {
        doctype: 'inline',
        attributes
    });
}

module.exports = {
    name: 'asciidoc',
    FILE_EXTENSIONS,
    prepare,
    toDocument,
    toText,
    toHTML,
    toInlineHTML
};
