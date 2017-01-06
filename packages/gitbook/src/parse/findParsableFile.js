const path = require('path');

const Promise = require('../utils/promise');
const { FILE_EXTENSIONS } = require('../parsers');

/**
 * Find a file parsable (Markdown or AsciiDoc) in a book
 *
 * @param {Book} book
 * @param {String} filename
 * @return {Promise<File | Undefined>}
 */
function findParsableFile(book, filename) {
    const fs = book.getContentFS();
    const basename = path.basename(filename, path.extname(filename));
    const basedir = path.dirname(filename);

    return Promise.some(FILE_EXTENSIONS, (ext) => {
        const filepath = basename + ext;

        return fs.findFile(basedir, filepath)
        .then((found) => {
            if (!found || book.isContentFileIgnored(found)) {
                return undefined;
            }

            return fs.statFile(found);
        });
    });
}

module.exports = findParsableFile;
