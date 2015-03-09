var path = require('path');
var assert = require('assert');

var Book = require('../').Book;

describe('Configuration parsing', function () {
    it('should correctly load from json', function() {
        assert(books[0].options.title == "Test");
    });

    it('should correctly load from javascript', function() {
        assert(books[4].options.title == "Test 2");
    });
});
