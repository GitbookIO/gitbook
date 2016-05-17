var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');

describe('parseSummary', function() {
    var parseSummary = require('../parseSummary');

    it('should parse summary if exists', function() {
        var fs = createMockFS({
            'SUMMARY.md': '# Summary\n\n* [Hello](hello.md)'
        });
        var book = Book.createForFS(fs);

        return parseSummary(book)
        .then(function(resultBook) {
            var summary = resultBook.getSummary();
            var file = summary.getFile();

            expect(file.exists()).toBeTruthy();
        });
    });

    it('should not fail if doesn\'t exist', function() {
        var fs = createMockFS({});
        var book = Book.createForFS(fs);

        return parseSummary(book)
        .then(function(resultBook) {
            var summary = resultBook.getSummary();
            var file = summary.getFile();

            expect(file.exists()).toBeFalsy();
        });
    });
});
