const tmp = require('tmp');

const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');
const parseBook = require('../../parse/parseBook');
const generateBook = require('../generateBook');

/**
 * Generate a book using a generator
 * And returns the path to the output dir.
 *
 * FOR TESTING PURPOSE ONLY
 *
 * @param {Generator}
 * @param {Map<String:String|Map>} files
 * @return {Promise<String>}
 */
function generateMock(Generator, files) {
    const fs = createMockFS(files);
    let book = Book.createForFS(fs);
    let dir;

    try {
        dir = tmp.dirSync();
    } catch (err) {
        throw err;
    }

    book = book.setLogLevel('disabled');

    return parseBook(book)
    .then((resultBook) => {
        return generateBook(Generator, resultBook, {
            root: dir.name
        });
    })
    .thenResolve(dir.name);
}

module.exports = generateMock;
