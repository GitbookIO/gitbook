var cheerio = require('cheerio');
var tmp = require('tmp');

describe('svgToImg', function() {
    var dir;
    var svgToImg = require('../svgToImg');

    beforeEach(function() {
        dir = tmp.dirSync();
    });

    it('should write svg as a file', function() {
        var $ = cheerio.load('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" version="1.1"><rect width="200" height="100" stroke="black" stroke-width="6" fill="green"/></svg>');

        return svgToImg(dir.name, 'index.html', $)
        .then(function() {
            var $img = $('img');
            var src = $img.attr('src');

            expect(dir.name).toHaveFile(src);
        });
    });
});


