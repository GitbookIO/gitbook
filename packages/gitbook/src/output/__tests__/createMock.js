const Immutable = require('immutable');

const Output = require('../../models/output');
const Book = require('../../models/book');
const parseBook = require('../../parse/parseBook');
const createMockFS = require('../../fs/mock');
const preparePlugins = require('../preparePlugins');

/**
 * Create an output using a generator
 *
 * FOR TESTING PURPOSE ONLY
 *
 * @param {Generator} generator
 * @param {Map<String:String|Map>} files
 * @return {Promise<Output>}
 */
function createMockOutput(generator, files, options) {
    const fs = createMockFS(files);
    let book = Book.createForFS(fs);
    const state = generator.State ? generator.State({}) : Immutable.Map();

    book = book.setLogLevel('disabled');
    options = generator.Options(options);

    return parseBook(book)
    .then((resultBook) => {
        return new Output({
            book:      resultBook,
            options,
            state,
            generator: generator.name
        });
    })
    .then(preparePlugins);
}

module.exports = createMockOutput;
