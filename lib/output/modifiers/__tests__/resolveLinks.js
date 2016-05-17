var path = require('path');
var cheerio = require('cheerio');
var resolveLinks = require('../resolveLinks');

describe('resolveLinks', function() {
    function resolveFileBasic(href) {
        return href;
    }

    function resolveFileCustom(href) {
        if (path.extname(href) == '.md') {
            return href.slice(0, -3) + '.html';
        }

        return href;
    }

    describe('Absolute path', function() {
        var TEST = '<p>This is a <a href="/test/cool.md"></a></p>';

        it('should resolve path starting by "/" in root directory', function() {
            var $ = cheerio.load(TEST);

            return resolveLinks('hello.md', resolveFileBasic, $)
            .then(function() {
                var link = $('a');
                expect(link.attr('href')).toBe('test/cool.md');
            });
        });

        it('should resolve path starting by "/" in child directory', function() {
            var $ = cheerio.load(TEST);

            return resolveLinks('afolder/hello.md', resolveFileBasic, $)
            .then(function() {
                var link = $('a');
                expect(link.attr('href')).toBe('../test/cool.md');
            });
        });
    });

    describe('Custom Resolver', function() {
        var TEST = '<p>This is a <a href="/test/cool.md"></a> <a href="afile.png"></a></p>';

        it('should resolve path correctly for absolute path', function() {
            var $ = cheerio.load(TEST);

            return resolveLinks('hello.md', resolveFileCustom, $)
            .then(function() {
                var link = $('a').first();
                expect(link.attr('href')).toBe('test/cool.html');
            });
        });

        it('should resolve path correctly for absolute path (2)', function() {
            var $ = cheerio.load(TEST);

            return resolveLinks('afodler/hello.md', resolveFileCustom, $)
            .then(function() {
                var link = $('a').first();
                expect(link.attr('href')).toBe('../test/cool.html');
            });
        });
    });

});


