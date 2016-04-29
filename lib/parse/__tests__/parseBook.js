var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');

describe('parseBook', function() {
    var parseBook = require('../parseBook');

    pit('should parse multilingual book', function() {
        var fs = createMockFS({
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'en': {
                'README.md': 'Hello'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        });
        var book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {
            var languages = resultBook.getLanguages();
            var books = resultBook.getBooks();

            expect(resultBook.isMultilingual()).toBe(true);
            expect(languages.getList().size).toBe(2);
            expect(books.size).toBe(2);
        });
    });
});
