const path = require('path');

const Promise = require('../utils/promise');
const parsers = require('../parsers');

/**
    Find a file parsable (Markdown or AsciiDoc) in a book

    @param {Book} book
    @param {String} filename
    @return {Promise<File | Undefined>}
*/
function findParsableFile(book, filename) {
    const fs = book.getContentFS();
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const basedir = path.dirname(filename);

    // Ordered list of extensions to test
    const exts = parsers.extensions;

    return Promise.some(exts, function(ext) {
        const filepath = basename + ext;

        return fs.findFile(basedir, filepath)
        .then(function(found) {
            if (!found || book.isContentFileIgnored(found)) {
                return undefined;
            }

            return fs.statFile(found);
        });
    });
}

module.exports = findParsableFile;
