var cheerio = require('cheerio');

var mock = require('./mock');
var AssetsInliner = require('../lib/output/assets-inliner');

describe('Assets Inliner Output', function() {

    describe('SVG', function() {
        var output;

        before(function() {
            var SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" version="1.1"><rect width="200" height="100" stroke="black" stroke-width="6" fill="green"/></svg>';

            return mock.outputDefaultBook(AssetsInliner, {
                'README.md': '![image](test.svg)',
                'inline.md': 'This is a svg: '+SVG,
                'test.svg': '<?xml version="1.0" encoding="UTF-8"?>' + SVG,
                'SUMMARY.md': '* [inline](inline.md)\n\n'
            })
            .then(function(_output) {
                output = _output;
            });
        });

        it('should correctly SVG files convert to PNG', function() {
            var page = output.book.getPage('README.md');
            var $ = cheerio.load(page.content);

            // Is there an image?
            var $img = $('img');
            $img.length.should.equal(1);

            // Does the file exists
            var src = $img.attr('src');
            output.should.have.file(src);
        });

        it('should correctly inline SVG convert to PNG', function() {
            var page = output.book.getPage('inline.md');
            var $ = cheerio.load(page.content);

            // Is there an image?
            var $img = $('img');
            $img.length.should.equal(1);

            // Does the file exists
            var src = $img.attr('src');
            output.should.have.file(src);
        });
    });

    describe('Remote Assets', function() {

    });
});

