const Book = require('../../models/book');
const createMockFS = require('../../fs/mock');

describe('parseSummary', function() {
    const parseSummary = require('../parseSummary');

    it('should parse summary if exists', function() {
        const fs = createMockFS({
            'SUMMARY.md': '# Summary\n\n* [Hello](hello.md)'
        });
        const book = Book.createForFS(fs);

        return parseSummary(book)
        .then(function(resultBook) {
            const summary = resultBook.getSummary();
            const file = summary.getFile();

            expect(file.exists()).toBeTruthy();
        });
    });

    it('should not fail if doesn\'t exist', function() {
        const fs = createMockFS({});
        const book = Book.createForFS(fs);

        return parseSummary(book)
        .then(function(resultBook) {
            const summary = resultBook.getSummary();
            const file = summary.getFile();

            expect(file.exists()).toBeFalsy();
        });
    });
});
