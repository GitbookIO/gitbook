var os = require('os');
var path = require('path');
var Q = require('q');
var _ = require('lodash');

var fsUtil = require('../lib/utils/fs');
var Book = require('../').Book;
var LOG_LEVELS = require('../').LOG_LEVELS;

require('./assertions');


var BOOKS = {};
var TMPDIR = os.tmpdir();


// Generate and return a book
function generateBook(bookId, test, opts) {
    opts = _.defaults(opts || {}, {
        prepare: function() {}
    });

    return parseBook(bookId, test, opts)
    .then(function(book) {

        return Q(opts.prepare(book))
        .then(function() {
            return book.generate(test);
        })
        .thenResolve(book);
    });
}

// Generate and return a book
function parseBook(bookId, test, opts) {
    opts = _.defaults(opts || {}, {
        testId: ''
    });

    test = test || 'website';
    var testId = [test, opts.testId].join('-');

    BOOKS[bookId] = BOOKS[bookId] || {};
    if (BOOKS[bookId][testId]) return Q(BOOKS[bookId][testId]);

    BOOKS[bookId][testId] = new Book(path.resolve(__dirname, 'books', bookId), {
        logLevel: LOG_LEVELS.DISABLED,
        config: {
            output: path.resolve(TMPDIR, bookId+'-'+testId)
        }
    });

    return BOOKS[bookId][testId].parse()
    .then(function() {
        return BOOKS[bookId][testId];
    });
}


global.books = {
    parse: parseBook,
    generate: generateBook
};

// Cleanup all tests
after(function() {
    return _.chain(BOOKS)
        .map(function(types) {
            return _.values(types);
        })
        .flatten()
        .reduce(function(prev, book) {
            return prev.then(function() {
                return fsUtil.remove(book.options.output);
            });
        }, Q())
        .value();
});
