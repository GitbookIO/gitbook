const path = require('path');
const Book = require('../models/book');
const createNodeFS = require('../fs/node');

/**
    Return a book instance to work on from
    command line args/kwargs

    @param {Array} args
    @param {Object} kwargs
    @return {Book}
*/
function getBook(args, kwargs) {
    const input = path.resolve(args[0] || process.cwd());
    const logLevel = kwargs.log;

    const fs = createNodeFS(input);
    const book = Book.createForFS(fs);

    return book.setLogLevel(logLevel);
}

module.exports = getBook;
