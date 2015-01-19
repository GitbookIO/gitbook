var path = require('path');
var assert = require('assert');

var Book = require('../').Book;

describe('Configuration parsing', function () {
    it('should correctly load from json', function(done) {
        var book = new Book(path.join(__dirname, './fixtures/configuration/json'));
        book.config.load()
        .then(function() {
        	assert(book.options.title == "Test");
        })
        .then(function() {
        	done()
        }, done);
    });

    it('should correctly load from javascript', function(done) {
        var book = new Book(path.join(__dirname, './fixtures/configuration/js'));
        book.config.load()
        .then(function() {
        	assert(book.options.title == "Test 2");
        })
        .then(function() {
        	done()
        }, done);
    });
});
