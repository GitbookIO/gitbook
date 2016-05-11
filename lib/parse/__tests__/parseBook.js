var Book = require('../../models/book');
var createMockFS = require('../../fs/mock');

describe('parseBook', function() {
    var parseBook = require('../parseBook');

    it('should parse multilingual book', function() {
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

    it('should parse book in a directory', function() {
        var fs = createMockFS({
            'book.json': JSON.stringify({
                root: './test'
            }),
            'test': {
                'README.md': 'Hello World',
                'SUMMARY.md': '# Summary\n\n* [Page](page.md)\n',
                'page.md': 'Page'
            }
        });
        var book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {
            var readme = resultBook.getReadme();
            var summary = resultBook.getSummary();
            var articles = summary.getArticlesAsList();

            expect(summary.getFile().exists()).toBe(true);
            expect(readme.getFile().exists()).toBe(true);
            expect(articles.size).toBe(2);
        });
    });

});
