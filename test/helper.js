var os = require('os');
var path = require('path');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');
var should = require('should');

var fsUtil = require('../lib/utils/fs');
var Book = require('../').Book;
var LOG_LEVELS = require('../').LOG_LEVELS;

var BOOKS = {};
var TMPDIR = os.tmpdir();


// Generate and return a book
function generateBook(bookId, test) {
    BOOKS[bookId] = BOOKS[bookId] || {};
    if (BOOKS[bookId][test]) return Q(BOOKS[bookId][test]);

    BOOKS[bookId][test] = new Book(path.resolve(__dirname, "books", bookId), {
        logLevel: LOG_LEVELS.DISABLED,
        output: path.resolve(TMPDIR, bookId+"-"+test)
    });

    console.log("gen");
    return BOOKS[bookId][test].parse()
    .then(function() {
        return BOOKS[bookId][test].generate(test);
    })
    .then(function() {
        return BOOKS[bookId][test];
    });
}

// Generate and return a book
function parseBook(bookId, test) {
    BOOKS[bookId] = BOOKS[bookId] || {};
    if (BOOKS[bookId][test]) return Q(BOOKS[book][test]);

    BOOKS[bookId] = new Book(path.resolve(__dirname, "books", bookId), {
        logLevel: LOG_LEVELS.DISABLED,
        output: path.resolve(TMPDIR, bookId+"-"+test)
    });

    return BOOKS[bookId].parse();
}


global.books = {
    parse: parseBook,
    generate: generateBook
};

// Cleanup all tests
after(function() {
    console.log("cleanup!");
    return _.chain(BOOKS)
        .map(function(types, bookId) {
            return _.values(types);
        })
        .reduce(function(prev, book) {
            return prev.then(function() {
                console.log("cleanup", book.options.output);
                return fsUtil.remove(book.options.output);
            })
        })
        .value();
});


