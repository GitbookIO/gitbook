const { State } = require('markup-it');
const AsciidoctorJS = require('asciidoctor.js');
const asciidoc = require('markup-it/lib/asciidoc');

const asciidocjs = AsciidoctorJS();

const FILE_EXTENSIONS = [
    '.adoc',
    '.asciidoc'
];

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
 * @return {String} html
 */
function toHTML(text) {
    return asciidocjs.convert(text, {
        attributes: 'showtitle'
    });
}

/**
 * Render asciidoc to inline HTML.
 * @param  {String} text
 * @return {String} html
 */
function toInlineHTML(text) {
    return asciidocjs.convert(text, {
        doctype: 'inline',
        attributes: 'showtitle'
    });
}

module.exports = {
    FILE_EXTENSIONS,
    toDocument,
    toHTML,
    toInlineHTML
};
