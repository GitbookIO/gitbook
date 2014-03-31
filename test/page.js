var fs = require('fs');
var path = require('path');
var assert = require('assert');

var page = require('../lib/page');


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/PAGE.md'), 'utf8');
var LEXED = page(CONTENT);

describe('Page parsing', function() {
    it('should detection sections', function() {
        assert.equal(LEXED.length, 3);
    });
});
