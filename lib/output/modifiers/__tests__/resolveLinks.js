var path = require('path');
var cheerio = require('cheerio');
var resolveLinks = require('../resolveLinks');

describe('resolveLinks', function() {
    function resolveFileBasic(href) {
        return 'fakeDir/' + href;
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
                expect(link.attr('href')).toBe('fakeDir/test/cool.md');
            });
        });

        it('should resolve path starting by "/" in child directory', function() {
            var $ = cheerio.load(TEST);

            return resolveLinks('afolder/hello.md', resolveFileBasic, $)
            .then(function() {
                var link = $('a');
                expect(link.attr('href')).toBe('../fakeDir/test/cool.md');
            });
        });
    });

    describe('Anchor', function() {
        it('should prevent anchors in resolution', function() {
            var TEST = '<p>This is a <a href="test/cool.md#an-anchor"></a></p>';
            var $ = cheerio.load(TEST);

            return resolveLinks('hello.md', resolveFileCustom, $)
            .then(function() {
                var link = $('a');
                expect(link.attr('href')).toBe('test/cool.html#an-anchor');
            });
        });

        it('should ignore pure anchor links', function() {
            var TEST = '<p>This is a <a href="#an-anchor"></a></p>';
            var $ = cheerio.load(TEST);

            return resolveLinks('hello.md', resolveFileCustom, $)
            .then(function() {
                var link = $('a');
                expect(link.attr('href')).toBe('#an-anchor');
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

    describe('External link', function() {
        var TEST = '<p>This is a <a href="http://www.github.com">external link</a></p>';

        it('should have target="_blank" attribute', function() {
            var $ = cheerio.load(TEST);

            return resolveLinks('hello.md', resolveFileBasic, $)
            .then(function() {
                var link = $('a');
                expect(link.attr('target')).toBe('_blank');
            });
        });
    });

});
