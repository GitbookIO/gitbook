var fs = require('fs');
var path = require('path');
var assert = require('assert');

var summary = require('../').parse.summary;
var navigation = require('../').parse.navigation;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/SUMMARY.md'), 'utf8');
var LEXED = summary(CONTENT);


describe('Summary navigation', function() {
    it('should provide next & prev entries for a file', function() {
        var nav = navigation(LEXED, [
            'README.md',
            'chapter-1/README.md',
            'chapter-1/ARTICLE1.md',
            'chapter-1/ARTICLE2.md',
            'chapter-2/README.md',
        ]);

        // Make sure it found the files we gave it
        assert(nav['README.md']);
        assert(nav['chapter-1/README.md']);
        assert(nav['chapter-1/ARTICLE1.md']);
        assert(nav['chapter-1/ARTICLE2.md']);
        assert(nav['chapter-2/README.md']);


        assert.equal(nav['README.md'].prev, null);
        assert.equal(nav['README.md'].next.path, 'chapter-1/README.md');

        assert.equal(nav['chapter-1/README.md'].prev.path, 'README.md');
        assert.equal(nav['chapter-1/README.md'].next.path, 'chapter-1/ARTICLE1.md');

        assert.equal(nav['chapter-1/ARTICLE1.md'].prev.path, 'chapter-1/README.md');
        assert.equal(nav['chapter-1/ARTICLE1.md'].next.path, 'chapter-1/ARTICLE2.md');

        assert.equal(nav['chapter-1/ARTICLE2.md'].prev.path, 'chapter-1/ARTICLE1.md');
        assert.equal(nav['chapter-1/ARTICLE2.md'].next.path, 'chapter-2/README.md');

        assert.equal(nav['chapter-2/README.md'].prev.path, 'chapter-1/ARTICLE2.md');
        assert.equal(nav['chapter-2/README.md'].next.path, 'chapter-3/README.md');
    });

    it('should give full tree, when not limited', function() {
        var nav = navigation(LEXED);

        assert(nav['README.md']);
        assert(nav['chapter-1/README.md']);
        assert(nav['chapter-1/ARTICLE1.md']);
        assert(nav['chapter-1/ARTICLE2.md']);
        assert(nav['chapter-2/README.md']);
        assert(nav['chapter-3/README.md']);
    });

    it('should detect levels correctly', function() {
        var nav = navigation(LEXED);

        assert.equal(nav['README.md'].level, '0');
        assert.equal(nav['chapter-1/README.md'].level, '1');
        assert.equal(nav['chapter-1/ARTICLE1.md'].level, '1.1');
        assert.equal(nav['chapter-1/ARTICLE2.md'].level, '1.2');
        assert.equal(nav['chapter-2/README.md'].level, '2');
        assert.equal(nav['chapter-3/README.md'].level, '3');
    });

    it('should not accept null paths', function() {
        var nav = navigation(LEXED);

        assert(!nav[null]);
    });
});
