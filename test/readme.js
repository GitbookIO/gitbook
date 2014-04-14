var fs = require('fs');
var path = require('path');
var assert = require('assert');

var readme = require('../').parse.readme;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/README.md'), 'utf8');
var LEXED = readme(CONTENT);

describe('Readme parsing', function () {

    it('should contain a title', function() {
        assert(LEXED.title);
    });

    it('should contain a description', function() {
        assert(LEXED.description);
    });

    it('should extract the right title', function() {
        assert.equal(LEXED.title, "This is the title");
    });

    it('should extract the right description', function() {
        assert.equal(LEXED.description, "This is the book description.");
    });
});
