var fs = require('fs');
var path = require('path');
var assert = require('assert');

var page = require('../').parse.page;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/PAGE.md'), 'utf8');
var LEXED = page(CONTENT);

describe('Page parsing', function() {
    it('should detection sections', function() {
        assert.equal(LEXED.length, 3);
    });

    it('should detection section types', function() {
        assert.equal(LEXED[0].type, 'normal');
        assert.equal(LEXED[1].type, 'exercise');
        assert.equal(LEXED[2].type, 'normal');
    });

    it('should gen content for normal sections', function() {
        assert(LEXED[0].content);
        assert(!LEXED[1].content);
        assert(LEXED[2].content);
    });
});
