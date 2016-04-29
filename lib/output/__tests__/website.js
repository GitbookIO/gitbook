var generateMock = require('../generateMock');
var WebsiteGenerator = require('../website');

describe('WebsiteGenerator', function() {

    pit('should generate an index.html', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World'
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
        });
    });

    pit('should generate an HTML file for each articles', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'SUMMARY.md': '# Summary\n\n* [Page](test/page.md)',
            'test': {
                'page.md': 'Hello 2'
            }
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
            expect(folder).toHaveFile('test/page.html');
        });
    });

    pit('should not generate file if entry file doesn\'t exist', function() {
        return generateMock(WebsiteGenerator, {
            'README.md': 'Hello World',
            'SUMMARY.md': '# Summary\n\n* [Page 1](page.md)\n* [Page 2](test/page.md)',
            'test': {
                'page.md': 'Hello 2'
            }
        })
        .then(function(folder) {
            expect(folder).toHaveFile('index.html');
            expect(folder).not.toHaveFile('page.html');
            expect(folder).toHaveFile('test/page.html');
        });
    });

    pit('should generate a multilingual book', function() {
        return generateMock(WebsiteGenerator, {
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'en': {
                'README.md': 'Hello'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        })
        .then(function(folder) {
            // It should generate languages
            expect(folder).toHaveFile('en/index.html');
            expect(folder).toHaveFile('fr/index.html');

            // Should not copy languages as assets
            expect(folder).not.toHaveFile('en/README.md');
            expect(folder).not.toHaveFile('fr/README.md');

            // Should copy assets only once
            expect(folder).toHaveFile('gitbook/style.css');
            expect(folder).not.toHaveFile('en/gitbook/style.css');

            expect(folder).toHaveFile('index.html');
        });
    });
});

