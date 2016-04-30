jest.autoMockOff();

var cheerio = require('cheerio');

describe('addHeadingId', function() {
    var addHeadingId = require('../addHeadingId');

    pit('should add an ID if none', function() {
        var $ = cheerio.load('<h1>Hello World</h1><h2>Cool !!</h2>');

        return addHeadingId($)
        .then(function() {
            var html = $.html();
            expect(html).toBe('<h1 id="hello-world">Hello World</h1><h2 id="cool-">Cool !!</h2>');
        });
    });

    pit('should not change existing IDs', function() {
        var $ = cheerio.load('<h1 id="awesome">Hello World</h1>');

        return addHeadingId($)
        .then(function() {
            var html = $.html();
            expect(html).toBe('<h1 id="awesome">Hello World</h1>');
        });
    });
});


