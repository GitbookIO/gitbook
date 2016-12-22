const path = require('path');
const PathUtils = require('../utils/path');
const LocationUtils = require('../utils/location');
const URIIndex = require('../models/uriIndex');

const OUTPUT_EXTENSION = '.html';

/**
 * Convert a filePath (absolute) to an url (without hostname).
 * It returns an absolute path.
 *
 * "README.md" -> "/index.html"
 * "test/hello.md" -> "test/hello.html"
 * "test/README.md" -> "test/index.html"
 *
 * @param {Output} output
 * @param {String} filePath
 * @return {String}
 */
function fileToURL(filePath) {
    if (
        path.basename(filePath, path.extname(filePath)) == 'README'
    ) {
        filePath = path.join(path.dirname(filePath), 'index' + OUTPUT_EXTENSION);
    } else {
        filePath = PathUtils.setExtension(filePath, OUTPUT_EXTENSION);
    }

    return LocationUtils.normalize(filePath);
}

/**
 * Parse a set of pages into an URIIndex.
 * Each pages is added as an entry in the index.
 *
 * @param  {OrderedMap<Page>} pages
 * @return {URIIndex} index
 */
function parseURIIndexFromPages(pages) {
    const urls = pages.map((page, filePath) => fileToURL(filePath));
    return new URIIndex(urls);
}

module.exports = parseURIIndexFromPages;
