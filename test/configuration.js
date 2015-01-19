var path = require('path');
var assert = require('assert');

var Book = require('../').Book;

describe('Configuration parsing', function () {
    it('should correctly load from json', function(done) {
        var book = new Book(path.join(__dirname, './fixtures/config'));
        book.config.load()
        .then(function() {
        	assert(book.options.title == "Test");
        })
        .then(function() {
        	done()
        }, done);
    });
});
