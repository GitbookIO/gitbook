var generateMock = require('./generateMock');
var EbookGenerator = require('../ebook');

describe('EbookGenerator', function() {

    it('should generate a SUMMARY.html', function() {
        return generateMock(EbookGenerator, {
            'README.md': 'Hello World'
        })
        .then(function(folder) {
            expect(folder).toHaveFile('SUMMARY.html');
            expect(folder).toHaveFile('index.html');
        });
    });
});

