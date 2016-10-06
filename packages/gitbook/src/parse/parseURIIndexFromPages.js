const path = require('path');
const PathUtils = require('../utils/path');
const LocationUtils = require('../utils/location');
const URIIndex = require('../models/uriIndex');

const OUTPUT_EXTENSION = '.html';

/**
 * Convert a filePath (absolute) to an url (without hostname).
 * It returns an absolute path.
 *
 * "README.md" -> "/"
 * "test/hello.md" -> "test/hello.html"
 * "test/README.md" -> "test/"
 *
 * @param {Output} output
 * @param {String} filePath
 * @return {String}
 */
function fileToURL(filePath, directoryIndex) {
    if (
        path.basename(filePath, path.extname(filePath)) == 'README'
    ) {
        filePath = path.join(path.dirname(filePath), 'index' + OUTPUT_EXTENSION);
    } else {
        filePath = PathUtils.setExtension(filePath, OUTPUT_EXTENSION);
    }

    if (directoryIndex && path.basename(filePath) == 'index.html') {
        filePath = path.dirname(filePath) + '/';
    }

    return LocationUtils.normalize(filePath);
}

/**
 * Parse a set of pages into an URIIndex.
 * Each pages is added as an entry in the index.
 *
 * @param  {OrderedMap<Page>} pages
 * @param  {Boolean} options.directoryIndex: should we use "index.html" or "/"
 * @return {URIIndex} index
 */
function parseURIIndexFromPages(pages, options) {
    options = options || {};
    if (typeof options.directoryIndex === 'undefined') {
        options.directoryIndex = true;
    }

    const urls = pages.map((page, filePath) => fileToURL(filePath, options.directoryIndex));
    return new URIIndex(urls);
}

module.exports = parseURIIndexFromPages;
