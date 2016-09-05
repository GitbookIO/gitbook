const cheerio = require('cheerio');
const addHeadingId = require('../addHeadingId');

describe('addHeadingId', function() {
    it('should add an ID if none', function() {
        const $ = cheerio.load('<h1>Hello World</h1><h2>Cool !!</h2>');

        return addHeadingId($)
        .then(function() {
            const html = $.html();
            expect(html).toBe('<h1 id="hello-world">Hello World</h1><h2 id="cool-">Cool !!</h2>');
        });
    });

    it('should not change existing IDs', function() {
        const $ = cheerio.load('<h1 id="awesome">Hello World</h1>');

        return addHeadingId($)
        .then(function() {
            const html = $.html();
            expect(html).toBe('<h1 id="awesome">Hello World</h1>');
        });
    });
});

