var fs = require('fs');
var path = require('path');
var assert = require('assert');

var page = require('../').parse.page;


var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/PAGE.md'), 'utf8');
var LEXED = page(CONTENT);

var HR_CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/HR_PAGE.md'), 'utf8');
var HR_LEXED = page(HR_CONTENT);

var LINKS_CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/GITHUB_LINKS.md'), 'utf8');


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
        assert(LEXED[2].content);
    });

    it('should gen code and content for exercise sections', function() {
        assert(LEXED[1].content);
        assert(LEXED[1].code);
        assert(LEXED[1].code.base);
        assert(LEXED[1].code.solution);
        assert(LEXED[1].code.validation);
    });

    it('should merge sections correctly', function() {
        // One big section
        assert.equal(HR_LEXED.length, 1);

        // HRs inserted correctly
        assert.equal(HR_LEXED[0].content.match(/<hr>/g).length, 2);
    });
});


describe('Relative links', function() {
    it('should be resolved to their GitHub counterparts', function() {
        var LEXED = page(LINKS_CONTENT, {
            // GitHub repo ID
            repo: 'GitBookIO/javascript',

            // Imaginary folder of markdown file
            dir: 'course',
        });

        assert(LEXED[0].content.indexOf('https://github.com/GitBookIO/javascript/blob/src/something.cpp') !== -1);
    });
});
