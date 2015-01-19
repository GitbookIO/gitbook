var path = require('path');
var assert = require('assert');

var Book = require('../').Book;

describe('Book parsing', function () {
    it('should correctly parse the readme', function() {
        assert.equal(book1.options.title, 'My Book');
    	assert.equal(book1.options.description, 'Test description');
    });

    it('should correctly parse the summary', function() {
        var LEXED = book1.summary;

        assert.equal(LEXED.chapters[0].path, 'intro.md');
    	assert.equal(LEXED.chapters[1].path, 'test.md');
        assert.equal(LEXED.chapters[2].path, 'test2.md');
    });
});
