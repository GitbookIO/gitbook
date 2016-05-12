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

    it('should extend configuration for multilingual book', function() {
        var fs = createMockFS({
            'LANGS.md': '# Languages\n\n* [en](en)\n* [fr](fr)',
            'book.json': '{ "title": "Test", "author": "GitBook" }',
            'en': {
                'README.md': 'Hello',
                'book.json': '{ "title": "Test EN" }'
            },
            'fr': {
                'README.md': 'Bonjour'
            }
        });
        var book = Book.createForFS(fs);

        return parseBook(book)
        .then(function(resultBook) {
            var books = resultBook.getBooks();

            expect(resultBook.isMultilingual()).toBe(true);
            expect(books.size).toBe(2);

            var en = books.get('en');
            var fr = books.get('fr');

            var enConfig = en.getConfig();
            var frConfig = fr.getConfig();

            expect(enConfig.getValue('title')).toBe('Test EN');
            expect(enConfig.getValue('author')).toBe('GitBook');

            expect(frConfig.getValue('title')).toBe('Test');
            expect(frConfig.getValue('author')).toBe('GitBook');
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
