const Immutable = require('immutable');

const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');
const listAssets = require('../listAssets');
const parseGlossary = require('../parseGlossary');

describe('listAssets', () => {
    it('should not list glossary as asset', () => {
        const fs = createMockFS({
            'GLOSSARY.md': '# Glossary\n\n## Hello\nDescription for hello',
            'assetFile.js': '',
            'assets': {
                'file.js': ''
            }
        });
        const book = Book.createForFS(fs);

        return parseGlossary(book)
        .then((resultBook) => {
            return listAssets(resultBook, Immutable.Map());
        })
        .then((assets) => {
            expect(assets.size).toBe(2);
            expect(assets.includes('assetFile.js'));
            expect(assets.includes('assets/file.js'));
        });
    });
});
