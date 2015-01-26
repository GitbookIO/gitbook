var path = require('path');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');

var fsUtil = require("../lib/utils/fs");
var Book = require('../').Book;

// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};

// Test generation of a book
global.testGeneration = function(book, type, func, done) {
    var OUTPUT_PATH = book.options.output;

    qdone(
        book.generate(type)
            .then(function() {
                func(OUTPUT_PATH);
            })
            .fin(function() {
                return fsUtil.remove(OUTPUT_PATH);
            }),
        done);
};

// Books for testings
var books = fs.readdirSync(path.join(__dirname, './fixtures/'));

global.books = _.chain(books)
    .sortBy()
    .map(function(book) {
        if (book.indexOf("test") !== 0) return null;
        return new Book(path.join(__dirname, './fixtures/', book), {
            logLevel: Book.LOG_LEVELS.DISABLED
        });
    })
    .compact()
    .value();

// Init before doing tests
before(function(done) {

    qdone(
	    _.reduce(global.books, function(prev, book) {
            return prev.then(function() {
                return fsUtil.remove(path.join(book.root, "_book"));
            })
            .then(function() {
                return book.parse();
            });
        }, Q()),
	    done
	);
});
