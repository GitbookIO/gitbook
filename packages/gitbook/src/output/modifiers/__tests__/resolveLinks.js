const cheerio = require('cheerio');
const resolveLinks = require('../resolveLinks');

describe('resolveLinks', () => {
    function resolveFileBasic(href) {
        return 'fakeDir/' + href;
    }

    it('should resolve path using resolver', () => {
        const TEST = '<p>This is a <a href="test/cool.md"></a></p>';
        const $ = cheerio.load(TEST);

        return resolveLinks(resolveFileBasic, $)
        .then(function() {
            const link = $('a');
            expect(link.attr('href')).toBe('fakeDir/test/cool.md');
        });
    });

    describe('External link', () => {
        const TEST = '<p>This is a <a href="http://www.github.com">external link</a></p>';

        it('should have target="_blank" attribute', () => {
            const $ = cheerio.load(TEST);

            return resolveLinks(resolveFileBasic, $)
            .then(function() {
                const link = $('a');
                expect(link.attr('target')).toBe('_blank');
            });
        });
    });

});
