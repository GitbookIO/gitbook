var cheerio = require('cheerio');
var tmp = require('tmp');

describe('fetchRemoteImages', function() {
    var dir;
    var fetchRemoteImages = require('../fetchRemoteImages');

    beforeEach(function() {
        dir = tmp.dirSync();
    });

    pit('should download image file', function() {
        var $ = cheerio.load('<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png" />');

        return fetchRemoteImages(dir.name, $)
        .then(function() {
            var $img = $('img');
            var src = '.' + $img.attr('src');

            expect(dir.name).toHaveFile(src);
        });
    });
});


