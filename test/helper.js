var path = require('path');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');

var Book = require('../').Book;

// Nicety for mocha / Q
global.qdone = function qdone(promise, done) {
    return promise.then(function() {
        return done();
    }, function(err) {
        return done(err);
    }).done();
};

// Books for testings
global.books = [];

// Init before doing tests
before(function(done) {
    var books = fs.readdirSync(path.join(__dirname, './fixtures/'));

    global.books = _.chain(books)
        .sortBy()
        .map(function(book) {
            if (book.indexOf("test") !== 0) return null;
            return new Book(path.join(__dirname, './fixtures/', book));;
        })
        .compact()
        .value();

    qdone(
	    _.reduce(global.books, function(prev, book) {
            return prev.then(function() {
                return book.parse();
            });
        }, Q()),
	    done
	);
});
