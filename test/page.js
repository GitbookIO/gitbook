var fs = require('fs');
var path = require('path');
var assert = require('assert');

var page = require('../').parse.page;

function loadPage (name, options) {
    var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/' + name + '.md'), 'utf8');
    return page(CONTENT, options);
}

var LEXED = loadPage('PAGE', {
    dir: 'course',
    outdir: '_book'
});
var QUIZ_LEXED = loadPage('QUIZ_PAGE');
var HR_LEXED = loadPage('HR_PAGE');

describe('Page parsing', function() {
    it('should detect sections', function() {
        assert.equal(LEXED.length, 4);
    });

    it('should detect section types', function() {
        assert.equal(LEXED[0].type, 'normal');
        assert.equal(LEXED[1].type, 'exercise');
        assert.equal(LEXED[2].type, 'normal');
        assert.equal(QUIZ_LEXED[0].type, 'normal');
        assert.equal(QUIZ_LEXED[1].type, 'quiz');
        assert.equal(QUIZ_LEXED[2].type, 'normal');
        assert.equal(QUIZ_LEXED[3].type, 'quiz');
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
        assert(LEXED[1].code.context === null);

        assert(LEXED[3].content);
        assert(LEXED[3].code);
        assert(LEXED[3].code.base);
        assert(LEXED[3].code.solution);
        assert(LEXED[3].code.validation);
        assert(LEXED[3].code.context);
    });

    it('should merge sections correctly', function() {
        // One big section
        assert.equal(HR_LEXED.length, 1);

        // HRs inserted correctly
        assert.equal(HR_LEXED[0].content.match(/<hr>/g).length, 2);
    });

    it('should detect an exercise\'s language', function() {
        assert.equal(LEXED[1].lang, 'python');
    });

    it('should render a quiz', function() {
        assert(QUIZ_LEXED[1].content);
        assert(QUIZ_LEXED[1].quiz);
        assert(QUIZ_LEXED[1].quiz[0].base);
        assert(QUIZ_LEXED[1].quiz[0].solution);
        assert(QUIZ_LEXED[1].quiz[0].feedback);
        assert(QUIZ_LEXED[1].quiz[1].base);
        assert(QUIZ_LEXED[1].quiz[1].solution);
        assert(QUIZ_LEXED[1].quiz[1].feedback);
    });
});


describe('Relative links', function() {
    it('should replace link to .md by link to .html', function() {
        var LEXED = loadPage('MARKDOWN_LINKS', {
            // GitHub repo ID
            repo: 'GitBookIO/javascript',

            // Imaginary folder of markdown file
            dir: 'course',
            outdir: 'course'
        });

        assert(LEXED[0].content.indexOf('test.html') !== -1);
        assert(LEXED[0].content.indexOf('../before.html') !== -1);
    });
});

describe('Relative images', function() {
    it('should keep image relative with considering output directory in site format', function() {
        var LEXED = loadPage('IMAGES', {
            // GitHub repo ID
            repo: 'GitBookIO/javascript',

            // Imaginary folder of markdown file
            dir: 'syntax',
            outdir: 'syntax'
        });

        assert(LEXED[0].content.indexOf('"preview.png"') !== -1);
        assert(LEXED[0].content.indexOf('"../preview2.png"') !== -1);
    });

    it('should keep image relative with considering output directory in page format', function() {
        var LEXED = loadPage('IMAGES', {
            // GitHub repo ID
            repo: 'GitBookIO/javascript',

            // Imaginary folder of markdown file
            dir: 'syntax',
            outdir: './'
        });

        assert(LEXED[0].content.indexOf('"syntax/preview.png"') !== -1);
        assert(LEXED[0].content.indexOf('"preview2.png"') !== -1);
    });
});

describe('Section parsing', function() {
    it('should not have false positive quiz parsing', function() {
        var LEXED = loadPage('FALSE_QUIZ');

        assert.equal(LEXED[0].type, 'normal');
    });
});
