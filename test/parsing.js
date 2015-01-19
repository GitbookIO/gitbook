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

    it('should correctly parse the glossary', function() {
        var LEXED = book1.glossary;

        assert.equal(LEXED[0].id, "test");
        assert.equal(LEXED[0].name, "Test");
        assert.equal(LEXED[0].description, "a test text");

        assert.equal(LEXED[1].id, "test 2");
        assert.equal(LEXED[1].name, "Test 2");
        assert.equal(LEXED[1].description, "a second test");
    });

    it('should correctly parse the languages', function() {
        assert.equal(book2.books.length, 2);
    });
});
