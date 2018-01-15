var Immutable = require('immutable');

var Output = require('../../models/output');
var Book = require('../../models/book');
var parseBook = require('../../parse/parseBook');
var createMockFS = require('../../fs/mock');
var preparePlugins = require('../preparePlugins');

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
    var fs = createMockFS(files);
    var book = Book.createForFS(fs);
    var state = generator.State? generator.State({}) : Immutable.Map();

    book = book.setLogLevel('disabled');
    options = generator.Options(options);

    return parseBook(book)
    .then(function(resultBook) {
        return new Output({
            book:      resultBook,
            options:   options,
            state:     state,
            generator: generator.name
        });
    })
    .then(preparePlugins);
}

module.exports = createMockOutput;
