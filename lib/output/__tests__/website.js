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
});

