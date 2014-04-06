var fs = require('fs');
var path = require('path');
var assert = require('assert');

var summary = require('../').parse.summary;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/SUMMARY.md'), 'utf8');
var LEXED = summary(CONTENT);


describe('Summary parsing', function () {

    it('should detect chapters', function() {
        assert.equal(LEXED.chapters.length, 5);
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
        assert(LEXED.chapters[3].path);
        assert.equal(LEXED.chapters[4].path, null);

        assert(LEXED.chapters[0].title);
        assert(LEXED.chapters[1].title);
        assert(LEXED.chapters[2].title);
        assert(LEXED.chapters[3].title);
        assert(LEXED.chapters[4].title);
    });

    it('should normalize paths from .md to .html', function() {
        assert.equal(LEXED.chapters[0].path,'chapter-1/README.md');
        assert.equal(LEXED.chapters[1].path,'chapter-2/README.md');
        assert.equal(LEXED.chapters[2].path,'chapter-3/README.md');
    });

    it('should detect levels correctly', function() {
        var c = LEXED.chapters;

        assert.equal(c[0].level, '1');
        assert.equal(c[1].level, '2');
        assert.equal(c[2].level, '3');

        assert.equal(c[0].articles[0].level, '1.1');
        assert.equal(c[0].articles[1].level, '1.2');
    });
});
