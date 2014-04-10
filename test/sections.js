var fs = require('fs');
var path = require('path');
var assert = require('assert');

var lex = require('../').parse.lex;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/SECTIONS.md'), 'utf8');
var LEXED = lex(CONTENT);


describe('Section parsing', function() {
    it('should correctly split sections', function() {
        assert.equal(LEXED.length, 3);
    });

    it('should robustly detect exercises', function() {
        assert.equal(LEXED[0].type, 'normal');
        assert.equal(LEXED[1].type, 'exercise');
        assert.equal(LEXED[2].type, 'exercise');
    });
});
