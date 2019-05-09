var cheerio = require('cheerio');
var tmp = require('tmp');
var path = require('path');

var svgToImg = require('../svgToImg');
var svgToPng = require('../svgToPng');

describe('svgToPng', function() {
    var dir;

    beforeEach(function() {
        dir = tmp.dirSync();
    });

    it('should write svg as png file', function() {
        var $ = cheerio.load('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" version="1.1"><rect width="200" height="100" stroke="black" stroke-width="6" fill="green"/></svg>');
        var fileName = 'index.html';

        return svgToImg(dir.name, fileName, $)
        .then(function() {
            return svgToPng(dir.name, fileName, $);
        })
        .then(function() {
            var $img = $('img');
            var src = $img.attr('src');

            expect(dir.name).toHaveFile(src);
            expect(path.extname(src)).toBe('.png');
        });
    });
});


