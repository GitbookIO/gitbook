var path = require('path');
var assert = require('assert');

var Book = require('../').Book;

describe('Summary parsing', function () {
    it('should correctly parse it from markdown', function(done) {
        var book = new Book(path.join(__dirname, './fixtures/summary/markdown'));
        book.parseSummary()
        .then(function() {
            var LEXED = book.summary;

        	assert.equal(LEXED.chapters[0].path,'README.md');
            assert.equal(LEXED.chapters[1].path,'chapter-1/README.md');
            assert.equal(LEXED.chapters[2].path,'chapter-2/README.md');
            assert.equal(LEXED.chapters[3].path,'chapter-3/README.md');
        })
        .then(function() {
        	done()
        }, done);
    });
});
