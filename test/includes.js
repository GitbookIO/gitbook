var fs = require('fs');
var path = require('path');
var assert = require('assert');

var page = require('../').parse.page;

var FIXTURES_DIR = path.join(__dirname, './fixtures/');

function loadPage (name, options) {
    var CONTENT = fs.readFileSync(FIXTURES_DIR + name + '.md', 'utf8');
    return page(CONTENT, options);
}


describe('Code includes', function() {

    var LEXED = loadPage('INCLUDES', {
        'dir': FIXTURES_DIR,
    });

    var INCLUDED_C = fs.readFileSync(path.join(FIXTURES_DIR, 'included.c'), 'utf8');

    it('should work for snippets', function() {
        assert.equal(LEXED[0].type, 'normal');
        // Has replaced include
        assert.equal(
            LEXED[0].content.indexOf('{{ included.c }}'),
            -1
        );
    });

    it('should work for exercises', function() {
        assert.equal(LEXED[1].type, 'exercise');

        // Solution is trimmed version of source
        assert.equal(LEXED[1].code.solution, INCLUDED_C.trim());
    });
});
