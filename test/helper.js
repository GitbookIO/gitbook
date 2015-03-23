var os = require('os');
var path = require('path');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');
var should = require('should');

var fsUtil = require('../lib/utils/fs');
var Book = require('../').Book;
var LOG_LEVELS = require('../').LOG_LEVELS;

require("./assertions");


var BOOKS = {};
var TMPDIR = os.tmpdir();


// Generate and return a book
function generateBook(bookId, test) {
    return parseBook(bookId, test)
    .then(function(book) {
        return book.generate(test)
        .thenResolve(book);
    });
}

// Generate and return a book
function parseBook(bookId, test) {
    BOOKS[bookId] = BOOKS[bookId] || {};
    if (BOOKS[bookId][test]) return Q(BOOKS[bookId][test]);

    BOOKS[bookId][test] = new Book(path.resolve(__dirname, "books", bookId), {
        logLevel: LOG_LEVELS.DISABLED,
        config: {
            output: path.resolve(TMPDIR, bookId+"-"+test)
        }
    });

    return BOOKS[bookId][test].parse()
    .then(function() {
        return BOOKS[bookId][test].generate(test);
    })
    .then(function() {
        return BOOKS[bookId][test];
    });
}


global.books = {
    parse: parseBook,
    generate: generateBook
};

// Cleanup all tests
after(function() {
    return _.chain(BOOKS)
        .map(function(types, bookId) {
            return _.values(types);
        })
        .flatten()
        .reduce(function(prev, book) {
            return prev.then(function() {
                return fsUtil.remove(book.options.output);
            })
        }, Q())
        .value();
});


