var path = require('path');
var Book = require('../models/book');
var createNodeFS = require('../fs/node');

/**
    Return a book instance to work on from
    command line args/kwargs

    @param {Array} args
    @param {Object} kwargs
    @return {Book}
*/
function getBook(args, kwargs) {
    var input = path.resolve(args[0] || process.cwd());
    var logLevel = kwargs.log;

    var fs = createNodeFS(input);
    var book = Book.createForFS(fs);

    return book.setLogLevel(logLevel);
}

module.exports = getBook;
