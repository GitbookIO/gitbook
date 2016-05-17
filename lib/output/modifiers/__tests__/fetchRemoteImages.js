var cheerio = require('cheerio');
var tmp = require('tmp');
var path = require('path');

var URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';

describe('fetchRemoteImages', function() {
    var dir;
    var fetchRemoteImages = require('../fetchRemoteImages');

    beforeEach(function() {
        dir = tmp.dirSync();
    });

    it('should download image file', function() {
        var $ = cheerio.load('<img src="' + URL + '" />');

        return fetchRemoteImages(dir.name, 'index.html', $)
        .then(function() {
            var $img = $('img');
            var src = $img.attr('src');

            expect(dir.name).toHaveFile(src);
        });
    });

    it('should download image file and replace with relative path', function() {
        var $ = cheerio.load('<img src="' + URL + '" />');

        return fetchRemoteImages(dir.name, 'test/index.html', $)
        .then(function() {
            var $img = $('img');
            var src = $img.attr('src');

            expect(dir.name).toHaveFile(path.join('test', src));
        });
    });
});


