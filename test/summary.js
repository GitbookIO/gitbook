var fs = require('fs');
var path = require('path');
var assert = require('assert');

var summary = require('../lib/summary');


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
});
