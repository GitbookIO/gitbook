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
            'README.html',
            'chapter-1/README.html',
            'chapter-1/ARTICLE1.html',
            'chapter-1/ARTICLE2.html',
            'chapter-2/README.html',
        ]);

        // Make sure it found the files we gave it
        assert(nav['README.html']);
        assert(nav['chapter-1/README.html']);
        assert(nav['chapter-1/ARTICLE1.html']);
        assert(nav['chapter-1/ARTICLE2.html']);
        assert(nav['chapter-2/README.html']);


        assert.equal(nav['README.html'].prev, null);
        assert.equal(nav['README.html'].next.path, 'chapter-1/README.html');

        assert.equal(nav['chapter-1/README.html'].prev, null);
        assert.equal(nav['chapter-1/README.html'].next.path, 'chapter-1/ARTICLE1.html');

        assert.equal(nav['chapter-1/ARTICLE1.html'].prev.path, 'chapter-1/README.html');
        assert.equal(nav['chapter-1/ARTICLE1.html'].next.path, 'chapter-1/ARTICLE2.html');

        assert.equal(nav['chapter-1/ARTICLE2.html'].prev.path, 'chapter-1/ARTICLE1.html');
        assert.equal(nav['chapter-1/ARTICLE2.html'].next.path, 'chapter-2/README.html');

        assert.equal(nav['chapter-2/README.html'].prev.path, 'chapter-1/ARTICLE2.html');
        assert.equal(nav['chapter-2/README.html'].next.path, 'chapter-3/README.html');
    });

    it('should give full tree, when not limited', function() {
        var nav = navigation(LEXED);

        assert(nav['README.html']);
        assert(nav['chapter-1/README.html']);
        assert(nav['chapter-1/ARTICLE1.html']);
        assert(nav['chapter-1/ARTICLE2.html']);
        assert(nav['chapter-2/README.html']);
        assert(nav['chapter-3/README.html']);
    });
});
