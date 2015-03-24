var fs = require('fs');
var path = require('path');

describe('Configuration', function () {
    it('should extract default title from README', function() {
        return books.parse("basic")
            .then(function(book) {
                book.options.title.should.be.equal("Readme");
            });
    });

    it('should extract default description from README', function() {
        return books.parse("basic")
            .then(function(book) {
                book.options.description.should.be.equal("Default description for the book.");
            });
    });

    it('should correctly load from json (book.json)', function() {
        return books.parse("config-json")
            .then(function(book) {
                book.options.title.should.be.equal("json-config");
            });
    });

    it('should correctly load from JavaScript (book.js)', function() {
        return books.parse("config-js")
            .then(function(book) {
                book.options.title.should.be.equal("js-config");
            });
    });
});
