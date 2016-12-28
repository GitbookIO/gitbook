const path = require('path');
const Immutable = require('immutable');

const markdownParser = require('gitbook-markdown');
const asciidocParser = require('gitbook-asciidoc');

const EXTENSIONS_MARKDOWN = require('./constants/extsMarkdown');
const EXTENSIONS_ASCIIDOC = require('./constants/extsAsciidoc');
const Parser = require('./models/parser');

// This list is ordered by priority of parsers to use
const parsers = Immutable.List([
    Parser.create('markdown', EXTENSIONS_MARKDOWN, markdownParser),
    Parser.create('asciidoc', EXTENSIONS_ASCIIDOC, asciidocParser)
]);

/**
 * Return a specific parser by its name
 *
 * @param {String} name
 * @return {Parser|undefined}
 */
function getParser(name) {
    return parsers.find((parser) => {
        return parser.getName() === name;
    });
}

/**
 * Return a specific parser according to an extension
 *
 * @param {String} ext
 * @return {Parser|undefined}
 */
function getParserByExt(ext) {
    return parsers.find((parser) => {
        return parser.matchExtension(ext);
    });
}

/**
 * Return parser for a file
 *
 * @param {String} ext
 * @return {Parser|undefined}
 */
function getParserForFile(filename) {
    return getParserByExt(path.extname(filename));
}

// List all parsable extensions
const extensions = parsers
    .map((parser) => {
        return parser.getExtensions();
    })
    .flatten();

module.exports = {
    extensions,
    get: getParser,
    getByExt: getParserByExt,
    getForFile: getParserForFile
};
