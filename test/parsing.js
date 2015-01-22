var path = require('path');
var _ = require('lodash');
var assert = require('assert');

describe('Book parsing', function () {
    it('should correctly parse the readme', function() {
        assert.equal(books[1].options.title, 'My Book');
    	assert.equal(books[1].options.description, 'Test description');
    });

    it('should correctly parse the readme with asciidoc', function() {
        assert.equal(books[3].options.title, 'My Book');
        assert.equal(books[3].options.description, 'Test description');
    });

    it('should correctly parse the summary', function() {
        var LEXED = books[1].summary;

        assert.equal(LEXED.chapters[0].path, 'intro.md');
    	assert.equal(LEXED.chapters[1].path, 'test.md');
        assert.equal(LEXED.chapters[2].path, 'test2.md');
    });

    it('should correctly parse the glossary', function() {
        var LEXED = books[1].glossary;

        assert.equal(LEXED[0].id, "test");
        assert.equal(LEXED[0].name, "Test");
        assert.equal(LEXED[0].description, "a test text");

        assert.equal(LEXED[1].id, "test_2");
        assert.equal(LEXED[1].name, "Test 2");
        assert.equal(LEXED[1].description, "a second test");
    });

    it('should correctly parse list of files', function() {
        var FILES = books[1].files;

        assert.deepEqual(FILES, [ 'README.md', 'intro.md', 'sub/', 'sub/test1.md' ]);
    });

    it('should correctly parse the languages', function() {
        assert.equal(books[2].books.length, 2);
        assert(books[2].isMultilingual());

        assert.equal(books[2].books[0].options.lang, "en");
        assert.equal(books[2].books[0].options.title, "English Book");

        assert.equal(books[2].books[1].options.lang, "fr");
        assert.equal(books[2].books[1].options.title, "French Book");
    });

    it('should correctly parse the navigation', function() {
        var NAVIGATION = books[1].navigation;

        assert.equal(_.size(NAVIGATION), 2);
        assert(NAVIGATION["intro.md"])
        assert.equal(NAVIGATION["intro.md"].title, "Introduction");
        assert.equal(NAVIGATION["intro.md"].prev, null);
        assert.equal(NAVIGATION["intro.md"].next.title, "Chapter 1");
    });
});
