var Immutable = require('immutable');

var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');
var listAssets = require('../listAssets');
var parseGlossary = require('../parseGlossary');

describe('listAssets', function() {
    it('should not list glossary as asset', function() {
        var fs = createMockFS({
            'GLOSSARY.md': '# Glossary\n\n## Hello\nDescription for hello',
            'assetFile.js': '',
            'assets': {
                'file.js': ''
            }
        });
        var book = Book.createForFS(fs);

        return parseGlossary(book)
        .then(function(resultBook) {
            return listAssets(resultBook, Immutable.Map());
        })
        .then(function(assets) {
            expect(assets.size).toBe(2);
            expect(assets.includes('assetFile.js'));
            expect(assets.includes('assets/file.js'));
        });
    });
});
