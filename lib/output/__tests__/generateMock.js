var tmp = require('tmp');

var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');
var parseBook = require('../../parse/parseBook');
var generateBook = require('../generateBook');

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
    var fs = createMockFS(files);
    var book = Book.createForFS(fs);
    var dir;

    try {
        dir = tmp.dirSync();
    } catch(err) {
        throw err;
    }

    book = book.setLogLevel('disabled');

    return parseBook(book)
    .then(function(resultBook) {
        return generateBook(Generator, resultBook, {
            root: dir.name
        });
    })
    .thenResolve(dir.name);
}

module.exports = generateMock;
