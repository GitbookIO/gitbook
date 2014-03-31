var fs = require('fs');
var path = require('path');
var assert = require('assert');

var summary = require('../').parse.summary;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/SUMMARY.md'), 'utf8');
var LEXED = summary(CONTENT);


describe('Summary parsing', function () {
    console.log(LEXED);

    it('should detect chapters', function() {
        assert.equal(LEXED.chapters.length, 3);
    });

    it('should support articles', function() {
        assert.equal(LEXED.chapters[0].articles.length, 2);
        assert.equal(LEXED.chapters[1].articles.length, 0);
        assert.equal(LEXED.chapters[2].articles.length, 0);
    });

    it('should detect paths and titles', function() {
        assert(LEXED.chapters[0].path);
        assert(LEXED.chapters[1].path);
        assert(LEXED.chapters[2].path);

        assert(LEXED.chapters[0].title);
        assert(LEXED.chapters[1].title);
        assert(LEXED.chapters[2].title);
    });

    it('should normalize paths from .md to .html', function() {
        assert.equal(LEXED.chapters[0].path,'chapter-1/README.html');
        assert.equal(LEXED.chapters[0]._path,'chapter-1/README.md');
        assert.equal(LEXED.chapters[1].path,'chapter-2/README.html');
        assert.equal(LEXED.chapters[1]._path,'chapter-2/README.md');
        assert.equal(LEXED.chapters[2].path,'chapter-3/README.html');
        assert.equal(LEXED.chapters[2]._path,'chapter-3/README.md');
    });
});
