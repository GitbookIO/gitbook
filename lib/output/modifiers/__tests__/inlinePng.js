var cheerio = require('cheerio');
var tmp = require('tmp');
var inlinePng = require('../inlinePng');

describe('inlinePng', function() {
    var dir;

    beforeEach(function() {
        dir = tmp.dirSync();
    });

    it('should write an inline PNG using data URI as a file', function() {
        var $ = cheerio.load('<img alt="GitBook Logo 20x20" src="data:image/png;base64,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"/>');

        return inlinePng(dir.name, 'index.html', $)
        .then(function() {
            var $img = $('img');
            var src = $img.attr('src');

            expect(dir.name).toHaveFile(src);
        });
    });
});


