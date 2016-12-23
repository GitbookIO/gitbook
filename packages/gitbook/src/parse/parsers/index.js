const path = require('path');
const { Map } = require('immutable');

const PARSERS = new Map({
    markdown: require('./markdown'),
    asciidoc: require('./asciidoc')
});

/**
 * Return a specific parser by its name
 *
 * @param {String} name
 * @return {Parser} parser?
 */
function getParser(name) {
    return PARSERS.get(name);
}

/**
 * Return a specific parser according to an extension
 *
 * @param {String} ext
 * @return {Parser} parser?
 */
function getByExt(ext) {
    return PARSERS.find(parser => parser.FILE_EXTENSIONS.includes(ext));
}

/**
 * Return parser for a file
 *
 * @param {String} ext
 * @return {Parser} parser?
 */
function getForFile(filename) {
    return getByExt(path.extname(filename));
}

module.exports = {
    get: getParser,
    getByExt,
    getForFile
};
