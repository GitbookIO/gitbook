var path = require('path');
var assert = require('assert');

var Book = require('../').Book;

describe('Book parsing', function () {
    it('should correctly parse it from markdown', function() {
        var LEXED = book1.summary;

        assert.equal(LEXED.chapters[0].path,'intro.md');
    	assert.equal(LEXED.chapters[1].path,'test.md');
        assert.equal(LEXED.chapters[2].path,'test2.md');
    });
});
